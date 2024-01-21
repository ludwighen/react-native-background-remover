import React, { useState } from 'react';
import { View, Image, Button } from 'react-native';
import { HomeScreenPropType } from '../../types';
import { ImagePickerAsset, launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

function Home(props: HomeScreenPropType) {

  const [image, setImage] = useState('');

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {image && <Image source={{ uri: image }} style={{ width: 300, height: 300 }} resizeMode="contain" />}
      <Button title="Select image" onPress={pickImage} />
    </View>
  );
}

export default Home;
