import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, ActivatedRouteSnapshot } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
      });

    // Build once initially
    this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
  }

  /* Build breadcrumb chain (A → B → C) */
  
  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = ''
  ): Breadcrumb[] {

    const breadcrumbs: Breadcrumb[] = [];
    let current: ActivatedRoute | null = route;
    let accumulatedUrl: string = url;

    while (current) {

      const children: ActivatedRoute[] = current.children;

      if (children.length === 0) break;

      // find primary child
      const primaryChild: ActivatedRoute | undefined =
        children.find((child: ActivatedRoute) => child.outlet === 'primary');

      if (!primaryChild) break;

      const snapshot: ActivatedRouteSnapshot = primaryChild.snapshot;

      const routeURL: string = snapshot.url
        .map((segment: any) => segment.path)
        .join('/');

      // Skip empty child route (avoid duplicate breadcrumb)
      if (!routeURL && !snapshot.data['breadcrumb']) {
        current = primaryChild;
        continue;
      }

      if (routeURL) {
        accumulatedUrl += `/${routeURL}`;
      }

      const label: string | undefined = snapshot.data['breadcrumb'];

      if (label) {
        breadcrumbs.push({
          label: label,
          url: accumulatedUrl || '/'
        });
      }

      current = primaryChild;
    }

    return breadcrumbs;
  }
}
