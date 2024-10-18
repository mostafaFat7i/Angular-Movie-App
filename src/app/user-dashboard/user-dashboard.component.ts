import { Component, OnInit, OnDestroy } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { AuthService } from '../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import FormBuilder and FormGroup


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


interface PaginatedMoviesResponse {
  movies: Movie[];
  totalPages: number;
  totalItems: number; // Optional if you want to display total items
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  errorMessage: string | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  loading: boolean = false; // Loading state
  userRatings: { [imdbID: string]: number } = {};  // Store user ratings by movie ID
  currentUserRatings: { [imdbID: string]: number } = {};
  selectedMovie: Movie | null = null; // Track the selected movie for rating
  selectedMovieDetails: Movie | null = null; // Track the selected movie for details
  searchForm: FormGroup; // Declare the FormGroup for search

  private subscriptions: Subscription = new Subscription(); // Subscription tracking

  constructor(private movieService: MovieService, private authService: AuthService,
    private router: Router, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      title: ['', Validators.required] // Initialize the search form control
    });
  }

  ngOnInit(): void {
    this.fetchAllMovies();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Check if the user navigated back to the login page
        if (event.url === '/login') {
          // Trigger logout if the user navigates back to login
          this.authService.logout();
        }
      }
    });

    // Subscribe to value changes on the title input field
    this.searchForm.get('title')?.valueChanges.subscribe((title) => {
      if (!title) {
        this.fetchAllMovies(); // Fetch all movies if the input is empty
      }
    });
  }
  openRatingModal(movie: Movie): void {
    this.selectedMovie = movie; // Set the selected movie
    // this.selectedMovieDetails = null; // Close the modal
  }

  closeRatingModal(): void {
    this.selectedMovie = null; // Close the modal
    this.fetchAllMovies();
    // window.location.reload(); // Reload the page
  }

  openMovieDetails(movie: Movie): void {
    this.selectedMovieDetails = movie; // Set the selected movie
  }

  closeMovieDetails(): void {
    this.selectedMovieDetails = null; // Close the modal
  }


  fetchAllMovies(): void {
    this.loading = true; // Set loading to true before fetching
    const movieSub = this.movieService.getAllMovies(this.currentPage, this.pageSize).subscribe(
      (response: PaginatedMoviesResponse) => {
        this.movies = response.movies.map(movie => ({
          ...movie,
          userRating: movie.appRating || 0  // Initialize userRating with appRating or 0 if undefined
        }));
        this.totalPages = response.totalPages;  // Set the total pages from the response
        this.errorMessage = null;
        this.loading = false; // Loading complete
      },
      (error) => {
        this.handleError('Error fetching movies.', error);
      }
    );
    this.subscriptions.add(movieSub); // Track the subscription
  }


  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) { // Check if there's a next page
      this.currentPage++;
      this.fetchAllMovies();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchAllMovies();
    }
  }

  rateMovie(rating: number, imdbID: string): void {
    if (rating !== undefined && imdbID) {
      console.log('Rating movie:', imdbID, 'with rating:', rating);

      this.movieService.rateMovie(imdbID, rating).subscribe(
        response => {
          console.log('Movie rated successfully:', response);
          this.closeRatingModal();
        },
        error => {
          this.handleError('Error rating movie.', error);
        }
      );
    } else {
      this.handleError('Please select a valid rating.', rating);
    }
  }



  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = message;
    this.loading = false; // Loading complete
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up subscriptions

  }
  fetchMoviesByTitle(title: string): void {
    this.loading = true; // Set loading state
    const movieSub = this.movieService.searchInDB(title, this.currentPage, this.pageSize).subscribe(
      (response: PaginatedMoviesResponse) => {
        this.movies = response.movies.map(movie => ({
          ...movie,
          userRating: movie.appRating || 0  // Initialize userRating with appRating or 0 if undefined
        })); // Set movies based on search response
        this.totalPages = response.totalPages; // Update total pages
        this.errorMessage = null;
        this.loading = false; // Loading complete
      },
      (error) => {
        this.handleError('Error fetching movies.', error);
        this.loading = false; // Ensure loading is false on error
      }
    );
    this.subscriptions.add(movieSub); // Track the subscription
  }

  clearSearch(): void {
    this.searchForm.reset(); // Reset the search form
    this.fetchAllMovies(); // Fetch all movies again
  }


  onSearch(): void {
    const title = this.searchForm.get('title')?.value;
    if (!title) {
      this.fetchAllMovies(); // Fetch all movies if search input is empty
    } else {
      this.fetchMoviesByTitle(title); // Fetch movies based on the title
    }
  }


}

