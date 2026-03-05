import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import * as signalR from '@microsoft/signalr';
import {environment} from '../../environments/environment';
import {StorageService} from './storage.service';
import {MessageModel} from '../_models/MessageModel';

@Injectable({providedIn: 'root'})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  private messageReceivedSubject = new Subject<MessageModel>();
  private unreadCountSubject = new Subject<number>();
  private gradeReadySubject = new Subject<{ gradeId: string; examId: string; gradeValue: number }>();

  messageReceived$: Observable<MessageModel> = this.messageReceivedSubject.asObservable();
  unreadCountUpdated$: Observable<number> = this.unreadCountSubject.asObservable();
  gradeReady$ = this.gradeReadySubject.asObservable();

  constructor(private storageService: StorageService) {}

  connect(): void {
    if (this.hubConnection) return;

    const user = this.storageService.getUser();
    if (!user?.accessToken) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/messages`, {
        accessTokenFactory: () => user.accessToken
      })
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
      .build();

    this.hubConnection.onreconnecting(err =>
      console.warn('SignalR reconnecting...', err)
    );

    this.hubConnection.onreconnected(connectionId =>
      console.log('SignalR reconnected:', connectionId)
    );

    this.hubConnection.onclose(err => {
      console.warn('SignalR connection closed. Retrying in 5s...', err);
      this.hubConnection = null;
      setTimeout(() => this.connect(), 5000);
    });

    this.hubConnection.on('ReceiveMessage', (message: MessageModel) => {
      this.messageReceivedSubject.next(message);
    });

    this.hubConnection.on('UpdateUnreadCount', (count: number) => {
      this.unreadCountSubject.next(count);
    });

    this.hubConnection.on('GradeReady', (data: { gradeId: string; examId: string; gradeValue: number }) => {
      this.gradeReadySubject.next(data);
    });

    this.hubConnection.start().catch(err => console.error('SignalR connection error:', err));
  }

  disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }
}
