// src/app/core/services/storage.service.ts

import { Injectable } from '@angular/core';
import {
  StorageReference,
  uploadBytesResumable,
  UploadTask,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  FullMetadata,
  ref,
} from 'firebase/storage';
import { storage } from '../../firebase/firebase-config';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  /**
   * Sube un archivo a Firebase Storage. Es la responsabilidad de la aplicación
   * que lo usa definir la ruta (ej. 'usuarios/uid/perfil.jpg').
   * Retorna una tarea de subida para monitorear el progreso.
   */
  async subirArchivo(ruta: string, archivo: File): Promise<UploadTask> {
    const storageRef = ref(storage, ruta);
    return uploadBytesResumable(storageRef, archivo);
  }

  /**
   * Sube múltiples archivos a un directorio de Storage.
   * Retorna un array de promesas con las URLs de descarga.
   */
  async subirMultiplesArchivos(
    directorio: string,
    archivos: File[]
  ): Promise<string[]> {
    const promesasDeSubida = archivos.map(async (archivo) => {
      const ruta = `${directorio}/${archivo.name}`;
      const storageRef = ref(storage, ruta);
      const snapshot = await uploadBytesResumable(storageRef, archivo);
      return getDownloadURL(snapshot.ref);
    });

    return Promise.all(promesasDeSubida);
  }

  /**
   * Obtiene la URL de descarga de un archivo ya subido.
   * Esto es útil para mostrar archivos sin necesidad de volver a subirlos.
   */
  async obtenerUrl(ruta: string): Promise<string> {
    const storageRef = ref(storage, ruta);
    return getDownloadURL(storageRef);
  }

  /**
   * Obtiene los metadatos de un archivo, como el tipo de contenido o el tamaño.
   */
  async obtenerMetadatos(ruta: string): Promise<FullMetadata> {
    const storageRef = ref(storage, ruta);
    return getMetadata(storageRef);
  }

  /**
   * Elimina un archivo de Firebase Storage.
   */
  async eliminarArchivo(ruta: string): Promise<void> {
    const storageRef = ref(storage, ruta);
    await deleteObject(storageRef);
  }

  /**
   * Lista las URLs de descarga de todos los archivos en un directorio.
   */
  async listarArchivos(directorio: string): Promise<string[]> {
    const storageRef = ref(storage, directorio);
    const files = await listAll(storageRef);
    return Promise.all(files.items.map((fileRef) => getDownloadURL(fileRef)));
  }
}
