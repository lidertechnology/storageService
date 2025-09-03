import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { StatesEnum } from '../../states/states.enum';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { storage } from '../firebase-config';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly storage = inject(Storage);

  public states: WritableSignal<StatesEnum> = signal(StatesEnum.INACTIVE);
  public uploadProgress: WritableSignal<number> = signal(0);

  public async subirArchivo(ruta: string, archivo: File): Promise<string> {
    try {
      this.states.set(StatesEnum.LOADING);
      this.uploadProgress.set(0);

      const storageRef = ref(storage, ruta);
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, archivo);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.uploadProgress.set(progreso);
          },
          (error) => {
            this.states.set(StatesEnum.ERROR);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            this.states.set(StatesEnum.SUCCESS);
            resolve(url);
          }
        );
      });
    } catch (error) {
      this.states.set(StatesEnum.ERROR);
      throw error;
    }
  }

  public async borrarArchivo(rutaStorage: string): Promise<void> {
    try {
      this.states.set(StatesEnum.LOADING);
      const archivoRef = ref(storage, rutaStorage);
      await deleteObject(archivoRef);
      this.states.set(StatesEnum.SUCCESS);
    } catch (error) {
      this.states.set(StatesEnum.ERROR);
      throw error;
    }
  }
}
