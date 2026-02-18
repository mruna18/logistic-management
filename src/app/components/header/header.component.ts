import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  appTitle = 'Project Management';
  userName = 'John Doe';
  userEmail = 'john.doe@example.com';
  userInitials = 'JD';
  
  isDropdownOpen = false;
  isMobileMenuOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Initialize user data - in a real app, this would come from a service
    this.setUserInitials();
  }

  private setUserInitials() {
    const names = this.userName.split(' ');
    this.userInitials = names.map(name => name.charAt(0).toUpperCase()).join('');
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    // Close mobile menu if open
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Close dropdown if open
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const userMenuButton = document.getElementById('user-menu-button');
    
    // Check if click is outside the dropdown
    if (userMenuButton && !userMenuButton.contains(target) && !target.closest('.absolute')) {
      this.isDropdownOpen = false;
    }
  }

  // Close menus on escape key
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
