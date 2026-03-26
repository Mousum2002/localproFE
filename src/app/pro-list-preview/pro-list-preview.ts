import { Component, OnInit, signal } from '@angular/core';
import { ProCard } from '../pro-card/pro-card';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PortalUser, OperationType } from '../model/entities';
import { UserService } from '../user-service';

@Component({
  selector: 'app-pro-list-preview',
  imports: [ProCard, FormsModule],
  templateUrl: './pro-list-preview.html',
  styleUrl: './pro-list-preview.css',
})
export class ProListPreview implements OnInit {

  allUsers = signal<PortalUser[]>([]);
  filteredUsers = signal<PortalUser[]>([]);
  operationTypes = signal<OperationType[]>([]);
  selectedTypeId: number | string = '';

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit() {
    // carica tutti i vendor tramite il service (con cache)
    this.userService.getAllUsers().subscribe(users => {
      const vendors = users.filter(u => u.role === 'VENDOR');
      this.allUsers.set(vendors);
      this.filteredUsers.set(vendors);
    });

    // carica le tipologie per il filtro
    this.http.get<OperationType[]>('http://localhost:8080/operation-types')
      .subscribe(types => this.operationTypes.set(types));
  }

  filterByType() {
    if (!this.selectedTypeId) {
      this.filteredUsers.set(this.allUsers());
      return;
    }
    this.userService.findByOperationType(Number(this.selectedTypeId))
      .subscribe(filtered => {
        const vendors = filtered.filter(u => u.role === 'VENDOR');
        this.filteredUsers.set(vendors);
      });
  }
}