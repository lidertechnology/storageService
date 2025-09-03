# INFORME DETALLADO STORAGE SERVICE:

# 1. Propósito y Filosofía del Servicio
El StorageService está diseñado para ser la única capa de abstracción para la gestión de archivos en Firebase Storage dentro de todas tus aplicaciones. Su filosofía es la de un servicio genérico, funcional y reutilizable, encapsulando toda la lógica de interacción con el SDK de Firebase. 
Al estar centralizado en tu biblioteca lidertechLibCentralModule, asegura que cada proyecto de Lidertech mantenga una convención unificada, código de alta calidad y una arquitectura escalable.

El servicio utiliza Angular Signals para la gestión de estados, lo que permite a tus componentes reaccionar de forma óptima a los cambios en el estado de las operaciones (ej. carga, éxito, error) sin usar RxJS, como es tu preferencia.

# 2. Funcionalidades y Métodos
  ## El servicio expone un conjunto de métodos async para realizar todas las operaciones comunes de almacenamiento.

* subirArchivo(ruta: string, archivo: File): Promise<UploadTask>:
  Sube un único archivo a una ruta específica.
  Este método es útil para subir, por ejemplo, imágenes de perfil ('usuarios/uid/perfil.jpg') o documentos específicos.
  Retorna la tarea de subida, lo que te permite monitorear el progreso de carga si es necesario.

* subirMultiplesArchivos(directorio: string, archivos: File[]): Promise<string[]>:
  Sube una lista de archivos a un directorio. Ideal para galerías de imágenes o subidas masivas.
  Retorna un Promise que resuelve con un array de URLs de descarga, lo cual es perfecto para guardar en Firestore.

* obtenerUrl(ruta: string): Promise<string>:
  Recupera la URL pública de un archivo ya subido.
  Esto es lo que usarás en tus templates para mostrar imágenes (<img [src]="url" />).

* obtenerMetadatos(ruta: string): Promise<FullMetadata>: 
Obtiene metadatos del archivo, como su tipo, tamaño y otras propiedades.

* eliminarArchivo(ruta: string): Promise<void>:
  Elimina un archivo permanentemente de Storage.

* listarArchivos(directorio: string): Promise<string[]>:
  Lista todos los archivos de un directorio y retorna un array de sus URLs de descarga.
  Útil para cargar todas las imágenes de una carpeta en una galería.

# 3. Gestión de Estados con StatesEnum
  
  ## Una de las características clave del servicio es su señal states, que se actualiza en cada operación.

* states.set(StatesEnum.LOADING):
  Se establece al inicio de cada método para indicar que una operación de carga o procesamiento ha comenzado.

* states.set(StatesEnum.SUCCESS):
  Se establece al final de cada operación que se completa sin errores, confirmando el éxito.

* states.set(StatesEnum.ERROR):
  Se establece si ocurre un error en cualquiera de los métodos, lo que permite a los componentes mostrar mensajes de error apropiados al usuario.

* states.set(StatesEnum.INACTIVE):
  Es el estado inicial del servicio y el que debería usarse cuando la operación ha finalizado y no se están realizando tareas activas.

# 4. Cómo Usarlo en tus Componentes

## Para usar el StorageService, solo necesitas inyectarlo en el constructor de tu componente.

TypeScript

    import { Component, inject } from '@angular/core';
    import { StorageService } from './core/services/storage.service';
    import { StatesEnum } from './shared/enums/states.enum';
    
    @Component({
      selector: 'app-mi-componente',
      standalone: true,
      template: `
        @if (storageService.states() === tant.LOADING) {
          <div class="loading-spinner">Cargando...</div>
        } @else if (storageService.states() === tant.SUCCESS) {
          <div class="success-message">¡Archivo subido con éxito!</div>
        } @else {
          <input type="file" (change)="subirImagen($event)" />
        }
      `,
    })
    export class MiComponente {
      private storageService = inject(StorageService);
      public readonly tant = StatesEnum;
    
      async subirImagen(event: any) {
        const file = event.target.files[0];
        if (file) {
          try {
            await this.storageService.subirArchivo('mi-app/imagenes/' + file.name, file);
            // La URL de descarga se puede obtener de la tarea o con obtenerUrl
          } catch (error) {
            console.error('Error al subir la imagen', error);
          }
        }
      }
    }

Como puedes ver en el ejemplo, la signal states te permite usar @if para mostrar la interfaz de usuario en función del estado de la operación de forma simple y declarativa, cumpliendo así con tu convención de usar Signals para la reactividad.
