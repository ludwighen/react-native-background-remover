import React, { useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { HomeScreenPropType } from '../../types';
import { removeBackground, saveImageLocally } from './helpers';

function Home(props: HomeScreenPropType) {
  const { navigation } = props;
  const [image, setImage] = useState('');
  const [cutout, setCutout] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const removeBackgroundOnConfirm = async (uri: string) => {
    setIsLoading(true);
    const base64Cutout = await removeBackground(uri);
    setCutout(base64Cutout);
    setIsLoading(false);
    const cutoutUri = await saveImageLocally({
      fileName: 'cutout.png',
      base64: base64Cutout,
    });
    navigation.navigate('Editor', { imageUri: uri, cutoutUri });
  };

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      quality: 0.2,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      setCutout('');
      await removeBackgroundOnConfirm(imageUri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {image && !cutout && (
        <Image
          source={{ uri: image }}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />
      )}
      {cutout && (
        <Image
          source={{ uri: `data:image/png;base64,${cutout}` }}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />
      )}
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
      <Button onPress={pickImage} mt={20}>
        <ButtonText>Select image</ButtonText>
      </Button>
    </View>
  );
}

export default Home;
