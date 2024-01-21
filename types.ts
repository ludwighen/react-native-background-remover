import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Editor: undefined;
};

export type HomeScreenPropType = NativeStackScreenProps<RootStackParamList, 'Home'>;

export type EditorScreenPropType = NativeStackScreenProps<RootStackParamList, 'Editor'>;
