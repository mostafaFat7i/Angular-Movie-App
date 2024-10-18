// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class MovieService {

//   constructor() { }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface PaginatedMoviesResponse {
  movies: Movie[];     // List of movies
  totalPages: number;   // Number of total pages
  totalItems: number;   // Total number of items (movies)
}
// interface userMoviesResponse {

// }

interface Movie {
  imdbID: string;
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;

  imdbRating: string;
  imdbVotes: string;

  appRating?: number;  // Average rating in the app, default to 0.0
  userRating?: number; // User input rating, optional
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly adminDashboardUrl = 'http://localhost:8090/admin/dashboard';
  private readonly userDashboardUrl = 'http://localhost:8090/user/dashboard';

  constructor(private http: HttpClient) { }

  // Admin: Search movies by title (case-insensitive)
  searchMovies(title: string): Observable<Movie[]> {
    const params = new HttpParams().set('title', title.toLowerCase());
    return this.http.get<Movie[]>(this.adminDashboardUrl, { params });
  }

  // User: Get all movies with pagination
  // getAllMovies(page: number = 0, size: number = 5): Observable<Movie[]> {
  //   const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
  //   return this.http.get<Movie[]>(this.userDashboardUrl, { params });
  // }

  // Add movie

  addMovie(imdbID: string): Observable<any> {
    // Construct the URL with the imdbID as a query parameter
    const url = `${this.adminDashboardUrl}/add?imdbID=${imdbID}`;

    // Using a POST request with no body since imdbID is in the URL
    return this.http.post(url, null); // Sending `null` as the body
  }


  // Remove movie
  removeMovie(imdbID: string): Observable<any> {
    return this.http.delete(`${this.adminDashboardUrl}/remove?imdbID=${imdbID}`);
  }

  rateMovie(movieId: string, rating: number): Observable<any> {
    var userId = localStorage.getItem('userId');
    const url = this.userDashboardUrl + `/rating/${movieId}?rating=${rating}&userId=${userId}`;  // Backend API endpoint for rating a movie
    // const params = new HttpParams().set('rating', rating.toString());

    return this.http.post(url, null);    // Sending rating as a POST request
  }

  getAllMovies(page: number, size: number): Observable<PaginatedMoviesResponse> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<PaginatedMoviesResponse>(this.userDashboardUrl, { params });
  }
  getUserRatings(userId: number): Observable<{ [imdbID: string]: number }> {

    return this.http.get<{ [imdbID: string]: number }>(this.userDashboardUrl + `/rating/${userId}`);
  }

  searchInDB(title: string, page: number, pageSize: number): Observable<PaginatedMoviesResponse> {
    return this.http.get<PaginatedMoviesResponse>(`${this.userDashboardUrl}/search?title=${title}&page=${page}&pageSize=${pageSize}`);
  }

  addBatchMovies(imdbIDs: string[]): Observable<any> {
    return this.http.post(`${this.adminDashboardUrl}/batch-add`, imdbIDs);
  }

  removeBatchMovies(imdbIDs: string[]): Observable<any> {
    return this.http.delete(`${this.adminDashboardUrl}/batch-remove`, { body: imdbIDs });
  }


}



