import { Injectable, signal } from '@angular/core';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { app } from '../../firebase/firebase-config';
import { StatesEnum } from '../../shared/enums/states.enum';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  public readonly states = signal(StatesEnum.INACTIVE);
  private messaging: Messaging | null = null;
  public readonly messagePayload = signal<any>(null);

  constructor() {
    isSupported().then((supported) => {
      if (supported) {
        this.messaging = getMessaging(app);
        if (environment.firebaseConfig) {
          // connectMessagingEmulator(this.messaging, "localhost", 5000);
        }
      }
    });
  }

  async obtenerToken(): Promise<string | null> {
    this.states.set(StatesEnum.LOADING);
    try {
      if (!this.messaging) {
        throw new Error('Firebase Cloud Messaging no es soportado en este navegador o no se ha inicializado.');
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: environment.vapidKey,
        });
        this.states.set(StatesEnum.SUCCESS);
        return token;
      } else if (permission === 'denied') {
        this.states.set(StatesEnum.UNAUTHORIZED);
        return null;
      } else {
        this.states.set(StatesEnum.INACTIVE);
        return null;
      }
    } catch (error) {
      this.states.set(StatesEnum.ERROR);
      throw error;
    }
  }

  escucharMensajesEnPrimerPlano(): void {
    if (this.messaging) {
      onMessage(this.messaging, (payload) => {
        this.messagePayload.set(payload);
      });
    }
  }
}
