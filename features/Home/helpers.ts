import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import type { ImageBody } from '../../types';

const URL = 'https://sdk.photoroom.com/v1/segment';

// Please replace with your own apiKey
const API_KEY = 'ENTER_API_KEY_HERE';

export const removeBackground = async (imageUri: string) => {
  try {
    const response = await FileSystem.uploadAsync(URL, imageUri, {
      fieldName: 'image_file',
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      headers: {
        'x-api-key': API_KEY,
        Accept: 'application/json',
      },
      parameters: {
        size: 'preview',
      },
    });

    const responseData = JSON.parse(response.body);
    return responseData.result_b64;
  } catch (e) {
    console.log(e);
  }
};

export const TEMP_DIR = `${FileSystem.cacheDirectory}images/`;

const imgFileUri = (fileName: string) => `${TEMP_DIR}${fileName}`;

// Checks if temp directory exists. If not, creates it
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(TEMP_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(TEMP_DIR, { intermediates: true });
  }
};

export const saveImageLocally = async (image: ImageBody) => {
  await ensureDirExists();
  const fileUri = imgFileUri(image.fileName);

  await FileSystem.writeAsStringAsync(fileUri, image.base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};

export function useUndoRedo<T>(initialState: T[]) {
  const [past, setPast] = useState<T[][]>([]);
  const [present, setPresent] = useState<T[]>(initialState);
  const [future, setFuture] = useState<T[][]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = () => {
    if (!canUndo) return;

    const newPast = [...past];
    const newPresent = newPast.pop();

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(newPresent as T[]);
  };

  const redo = () => {
    if (!canRedo) return;

    const newFuture = [...future];
    const newPresent = newFuture.shift();

    setPast([...past, present]);
    setFuture(newFuture);
    setPresent(newPresent as T[]);
  };

  const updatePresent = (newState: any) => {
    setPast([...past, present]);
    setPresent(newState);
    setFuture([]);
  };

  return [present, undo, redo, updatePresent, canUndo, canRedo] as [
    T[],
    () => void,
    () => void,
    (newState: T[]) => void,
    boolean,
    boolean,
  ];
}
