import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewResponse } from '../models/review.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/api/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number, page: number = 1, pageSize: number = 10): Observable<ReviewResponse> {
    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ReviewResponse>(`${this.apiUrl}/product/${productId}`, { params });
  }

  getUserReviews(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/${userId}`);
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  createReview(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  updateReview(id: number, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, review);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markReviewHelpful(reviewId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${reviewId}/helpful`, {});
  }

  getAverageRating(productId: number): Observable<{ averageRating: number; totalReviews: number }> {
    return this.http.get<{ averageRating: number; totalReviews: number }>(`${this.apiUrl}/product/${productId}/rating`);
  }
}