// whatever is places within ngZone gets put outside of Angular's change detection.

// for example let's say you're trying to prevent change detection upon a drag that runs 60fps.


// Taken From: https://blog.thoughtram.io/angular/2017/02/21/using-zones-in-angular-for-better-performance.html


// Okay, how do we achieve this? In our article on Zones in Angular, we already discussed how to run code outside Angular’s 
// Zone using NgZone.runOutsideAngular(). All we have to do is to make sure that the mouseMove() event handler is only attached and 
// executed outside Angular’s zone. In addition to that, we know we want to attach that event handler only if a box is being selected 
// for dragging. In other words, we need to change our mouseDown() event handler to imperatively add that 
// event listener to the document.


// Example:

@Component(...)
export class AppComponent {
//   ...
  element: HTMLElement;

  constructor(private zone: NgZone) {}

  mouseDown(event) {
    // ...
    this.element = event.target;

    this.zone.runOutsideAngular(() => {
      window.document.addEventListener('mousemove', this.mouseMove.bind(this));
    });
  }

  mouseMove(event) {
    event.preventDefault();
    this.element.setAttribute('x', event.clientX + this.clientX + 'px');
    this.element.setAttribute('y', event.clientX + this.clientY + 'px');
  }
}



// In the next step, we want to make sure that, whenever we release a box (mouseUp), we update the box model, plus, 
// we want to perform change detection so that the model is in sync with the view again. The cool thing about NgZone 
// is not only that it allows us to run code outside Angular’s Zone, it also comes with APIs to run code inside the 
// Angular Zone, which ultimately will cause Angular to perform change detection again. All we have to do is to call NgZone.run() 
// and give it the code that should be executed.

// Here’s the our updated mouseUp() event handler:

@Component(...)
export class AppComponent {
  ...
  mouseUp(event) {
    // Run this code inside Angular's Zone and perform change detection
    this.zone.run(() => {
      this.updateBox(this.currentId, event.clientX + this.offsetX, event.clientY + this.offsetY);
      this.currentId = null;
    });

    window.document.removeEventListener('mousemove', this.mouseMove);
  }
}