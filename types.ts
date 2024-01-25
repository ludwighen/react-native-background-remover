import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Editor: {
    imageUri: string;
    cutoutUri: string;
  };
};

export type HomeScreenPropType = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export type EditorScreenPropType = NativeStackScreenProps<
  RootStackParamList,
  'Editor'
>;

export type ImageBody = {
  fileName: string;
  base64: string;
};
