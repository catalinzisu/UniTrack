import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class AppRatingComponent {
  score = input<number>(0);
  readOnly = input<boolean>(false);
  scoreChange = output<number>();

  stars: number[] = [1, 2, 3, 4, 5];
  hoverState: number = 0;

  setHover(rating: number) {
    if (!this.readOnly()) {
      this.hoverState = rating;
    }
  }

  clearHover() {
    if (!this.readOnly()) {
      this.hoverState = 0;
    }
  }

  setRating(rating: number) {
    if (!this.readOnly()) {
      this.scoreChange.emit(rating);
    }
  }
}
