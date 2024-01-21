import React from 'react';
import { View, Text } from 'react-native';
import { EditorScreenPropType } from '../../types';

function Editor(props: EditorScreenPropType) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Editor Screen</Text>
    </View>
  );
}

export default Editor;
