import { Component, OnInit, OnDestroy } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router,NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

interface Movie {
  imdbID: string;
  title: string;
  year: string;
  poster: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  searchResults: Movie[] = [];
  errorMessage: string | null = null;
  loading: boolean = false; // Loading state
  private subscriptions: Subscription = new Subscription(); // Subscription tracking
  selectedMovies: string[] = []; // List of selected imdbIDs

  constructor(
    private movieService: MovieService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      title: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Any admin-specific initialization can go here
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Check if the user navigated back to the login page
        if (event.url === '/login') {
          // Trigger logout if the user navigates back to login
          this.authService.logout();
        }
      }
    });
  }

  // Method to toggle the selection of a movie card
  toggleSelection(imdbID: string): void {
    const index = this.selectedMovies.indexOf(imdbID);

    if (index === -1) {
      // Add imdbID to selected list
      this.selectedMovies.push(imdbID);
    } else {
      // Remove imdbID from selected list
      this.selectedMovies.splice(index, 1);
    }
  }
  // Method to check if a movie is selected
  isSelected(imdbID: string): boolean {
    return this.selectedMovies.includes(imdbID);
  }

  // Method to add selected movies
  addSelectedMovies(): void {
    if (this.selectedMovies.length > 0) {
      // Send the selected imdbIDs to the backend
      this.movieService.addBatchMovies(this.selectedMovies).subscribe(
        response => {
          // Show success message with the number of movies added
          this.showToast(`${this.selectedMovies.length} movies have been added to the database.`);
          // Clear the selection and hide the control panel
          this.selectedMovies = [];
        },
        error => {
          this.showToast(`Error adding movies: ${error.message}`);
        }
      );
    }
  }

  // Function to delete selected movies
  deleteSelectedMovies(): void {
    if (this.selectedMovies.length > 0) {
      this.movieService.removeBatchMovies(this.selectedMovies).subscribe(
        (response) => {
          this.showToast(`${this.selectedMovies.length} movies have been deleted successfully!`);
          this.clearSelection();
        },
        (error) => {
          this.showToast(`Error deleting movies: ${error.message}`);
        }
      );
    }
  }


  // Method to clear the selection
  clearSelection(): void {
    this.selectedMovies = [];
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.errorMessage = 'Please enter a movie title to search.';
      this.searchResults = [];
      return;
    }

    const title = this.searchForm.get('title')?.value.trim().toLowerCase();

    if (title) {
      this.loading = true; // Set loading to true before searching
      this.errorMessage = null; // Reset error message
      const searchSub = this.movieService.searchMovies(title).subscribe(
        (results) => {
          this.searchResults = results;
          if (this.searchResults.length === 0) {
            this.errorMessage = 'No movies found matching your search.';
          }
          this.loading = false; // Loading complete
        },
        (error) => {
          this.handleError('Error searching for movies.', error);
        }
      );
      this.subscriptions.add(searchSub); // Track the subscription
    } else {
      this.errorMessage = 'Search query cannot be empty.';
      this.searchResults = [];
    }
  }

  // addMovie(imdbID: string): void {
  //   this.loading = true; // Set loading to true while adding
  //   this.movieService.addMovie(imdbID).subscribe(
  //     (response) => {
  //       this.loading = false; // Loading complete
  //       this.searchResults.push(response); // Add to the displayed results
  //     },
  //     (error) => {
  //       this.handleError('Error adding movie.', error);
  //     }
  //   );
  // }
  addMovie(imdbID: string) {
    this.movieService.addMovie(imdbID).subscribe(

      complete => {
        this.showToast(`Movie with IMDb ID ${imdbID} has been added successfully!`);

        this.errorMessage = null;
      },
      error => {
        if (error.status === 409) {
          this.showToast(`Movie with IMDb ID ${imdbID} is already added to the database.`);
        } else {
          this.showToast(`Error adding ${imdbID}: ${error.message}`);
        }
      }
    );
  }


  showToast(message: string) {
    // Get the toast element
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    if (toast && toastText) {
      // Set the message and display the toast
      toastText.innerText = message;
      toast.classList.add('show');

      // Hide the toast after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  removeMovie(imdbID: string): void {
    this.loading = true; // Set loading to true while removing
    this.movieService.removeMovie(imdbID).subscribe(
      complete => {
        this.loading = false; // Loading complete
        // this.searchResults = this.searchResults.filter(movie => movie.imdbID !== imdbID); // Remove from displayed results
        this.showToast(`Movie with IMDb ID ${imdbID} has been deleted successfully!`);

      },
      (error) => {
        // Check if the error is a conflict (HTTP 409)
        if (error.status === 404) {
          this.showToast(`Movie with IMDb ID ${imdbID} is not found.`);
        } else {
          // Handle other types of errors
          this.showToast(`Error remove ${imdbID}: ${error.message}`);
        }

        this.handleError('Error removing movie.', error);
      }
    );
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.searchResults = [];
    this.errorMessage = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = message;
    this.loading = false; // Loading complete
    this.searchResults = [];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up subscriptions
  }


}
