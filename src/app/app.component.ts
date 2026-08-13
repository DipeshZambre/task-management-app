import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // Router outlet renders the active route component
  // template : html aur css hota he 
  template: '<router-outlet />'
})
export class AppComponent{}