/* eslint-disable react/style-prop-object */
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import {
  Canvas,
  useImage,
  Mask,
  Image,
  Skia,
  notifyChange,
  Path,
} from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { EditorScreenPropType } from '../../types';

function Editor(props: EditorScreenPropType) {
  const { route } = props;
  const cutout = useImage(route.params.cutoutUri);
  const original = useImage(route.params.imageUri);
  const { width } = useWindowDimensions();
  const currentPath = useSharedValue(Skia.Path.Make().moveTo(0, 0));
  const pointerX = useSharedValue(0);
  const pointerY = useSharedValue(0);
  const canvasWidth = width;
  const canvasHeight = width;

  const tapDraw = Gesture.Tap().onEnd(e => {
    currentPath.value.moveTo(e.x, e.y).lineTo(e.x, e.y);
    // notifyChange(currentPath);
  });

  const panDraw = Gesture.Pan()
    .averageTouches(true)
    .maxPointers(1)
    .onBegin(e => {
      pointerX.value = e.absoluteX;
      pointerY.value = e.absoluteY;
      // notifyChange(currentPath);
    })
    .onChange(e => {
      pointerX.value = e.absoluteX;
      pointerY.value = e.absoluteY;
      notifyChange(currentPath);
    });

  const composed = Gesture.Simultaneous(panDraw, tapDraw);

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={composed}>
        <Canvas
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'white',
          }}
        >
          {original && cutout && (
            <Mask
              mask={
                <>
                  <Image
                    image={cutout}
                    fit="contain"
                    width={canvasWidth}
                    height={canvasHeight}
                  />
                  <Path
                    path={currentPath}
                    style="stroke"
                    strokeWidth={30}
                    strokeCap="round"
                    blendMode="color"
                    strokeJoin="round"
                  />
                </>
              }
            >
              <Image
                image={original}
                fit="contain"
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
              />
            </Mask>
          )}
        </Canvas>
      </GestureDetector>
    </View>
  );
}

export default Editor;
