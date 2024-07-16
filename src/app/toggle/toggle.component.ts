import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="toggle" [class.active]="active" (click)="toggle()">
      <slot>Toggle!</slot>
    </div>
  `,
  styles: [`
    .toggle {
      padding:10px;
      border: solid black 1px;
      cursor: pointer;
      display: block;
      width: max-content;
      margin-top: 1rem;
    }

    .active {
      background-color: lightsteelblue;
    }
  `],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ToggleComponent implements OnInit {

  @Input() active = false;
  @Input() title = '';
  @Output() change = new EventEmitter<boolean>();

  ngOnInit(): void {
    sessionStorage.setItem('teste', 'teste');
  }

  toggle(): void {
    this.active = !this.active;
    this.change.emit(this.active);
  }

}