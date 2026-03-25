import { Component, OnInit, signal } from '@angular/core';
import { ProCard } from '../pro-card/pro-card';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PortalUser, OperationType } from '../model/entities';

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
  selectedType = signal<string>('');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<PortalUser[]>('http://localhost:8080/portaluser')
      .subscribe(users => {
        const vendors = users.filter(u => u.role === 'VENDOR');
        this.allUsers.set(vendors);
        this.filteredUsers.set(vendors);
      });

    this.http.get<OperationType[]>('http://localhost:8080/operationtype')
      .subscribe(types => this.operationTypes.set(types));
  }

  filterByType() {
    const type = this.selectedType();
    if (!type) {
      this.filteredUsers.set(this.allUsers());
      return;
    }
    this.filteredUsers.set(
      this.allUsers().filter(u =>
        u.operationProvided?.some(op => op.operationType?.name === type)
      )
    );
  }
}