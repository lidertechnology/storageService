import { Injectable, signal } from '@angular/core';
import { StorageReference,  uploadBytesResumable,  UploadTask,  getDownloadURL,  deleteObject,  listAll,  getMetadata,  FullMetadata,  ref,} from 'firebase/storage';
import { storage } from '../../firebase/firebase-config';
import { StatesEnum } from '../../shared/enums/states.enum';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public readonly states = signal(StatesEnum.INACTIVE);

  async subirArchivo(ruta: string, archivo: File): Promise<UploadTask> {
    this.states.set(StatesEnum.LOADING);
    const storageRef = ref(storage, ruta);
    return uploadBytesResumable(storageRef, archivo);
  }

  async subirMultiplesArchivos(  directorio: string,  archivos: File[]  ): Promise<string[]> {
    this.states.set(StatesEnum.LOADING);
    const promesasDeSubida = archivos.map(async (archivo) => {
      const ruta = `${directorio}/${archivo.name}`;
      const storageRef = ref(storage, ruta);
      const snapshot = await uploadBytesResumable(storageRef, archivo);
      return getDownloadURL(snapshot.ref);
    });

    return Promise.all(promesasDeSubida);
  }

  async obtenerUrl(ruta: string): Promise<string> {
    this.states.set(StatesEnum.LOADING);
    const storageRef = ref(storage, ruta);
    return getDownloadURL(storageRef);
  }

  async obtenerMetadatos(ruta: string): Promise<FullMetadata> {
    this.states.set(StatesEnum.LOADING);
    const storageRef = ref(storage, ruta);
    return getMetadata(storageRef);
  }

  async eliminarArchivo(ruta: string): Promise<void> {
    this.states.set(StatesEnum.LOADING);
    const storageRef = ref(storage, ruta);
    await deleteObject(storageRef);
  }

  async listarArchivos(directorio: string): Promise<string[]> {
    this.states.set(StatesEnum.LOADING);
    const storageRef = ref(storage, directorio);
    const files = await listAll(storageRef);
    return Promise.all(files.items.map((fileRef) => getDownloadURL(fileRef)));
  }
}
