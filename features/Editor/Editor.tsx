/* eslint-disable react/style-prop-object */
import React, { useState } from 'react';
import { Text, Switch, View, useWindowDimensions, Button } from 'react-native';
import {
  Canvas,
  useImage,
  Mask,
  Image,
  Skia,
  notifyChange,
  Path,
  SkPath,
  useCanvasRef,
  ImageFormat,
} from '@shopify/react-native-skia';
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { shareAsync } from 'expo-sharing';
import { EditorScreenPropType, PathWithWidth } from '../../types';
import { saveImageLocally, useUndoRedo } from '../Home/helpers';

function Editor(props: EditorScreenPropType) {
  const { route } = props;
  const cutout = useImage(route.params.cutoutUri);
  const original = useImage(route.params.imageUri);
  const { width } = useWindowDimensions();
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, undo, redo, setPaths, canUndo, canRedo] =
    useUndoRedo<PathWithWidth>([]);
  const currentPath = useSharedValue(Skia.Path.Make().moveTo(0, 0));
  const hasUpdatedPathState = useSharedValue(false);
  const isCurrentlyDrawing = useSharedValue(false);
  const canvasWidth = width;
  const canvasHeight = width;
  const ref = useCanvasRef();

  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const OVERLAY_WIDTH = 128;
  const offset = OVERLAY_WIDTH / 2;

  const onSave = async () => {
    const skiaImage = ref.current?.makeImageSnapshot();
    if (!skiaImage) return;

    const base64 = skiaImage.encodeToBase64(ImageFormat.PNG, 30);
    const fileUri = await saveImageLocally({
      fileName: 'updated-cutout.png',
      base64,
    });
    shareAsync(fileUri);
  };

  const updatePaths = (currentPathValue: SkPath) => {
    const newPath = {
      path: currentPathValue,
      blendMode: isDrawing ? 'color' : 'clear',
      strokeWidth: 30,
      id: `${Date.now()}`,
    };
    setPaths([...paths, newPath]);
    currentPath.value = Skia.Path.Make().moveTo(0, 0);
    hasUpdatedPathState.value = true;
  };

  const tapDraw = Gesture.Tap().onEnd(e => {
    currentPath.value.moveTo(e.x, e.y).lineTo(e.x, e.y);
    notifyChange(currentPath);
    runOnJS(updatePaths)(currentPath.value);
  });

  const panDraw = Gesture.Pan()
    .averageTouches(true)
    .maxPointers(1)
    .onBegin(e => {
      if (hasUpdatedPathState.value) {
        hasUpdatedPathState.value = false;
        currentPath.value = Skia.Path.Make().moveTo(e.x, e.y);
      } else {
        currentPath.value.moveTo(e.x, e.y);
      }
      notifyChange(currentPath);
    })
    .onChange(e => {
      if (hasUpdatedPathState.value) {
        hasUpdatedPathState.value = false;
        currentPath.value = Skia.Path.Make().moveTo(e.x, e.y);
      } else {
        currentPath.value.lineTo(e.x, e.y);
      }

      isCurrentlyDrawing.value = true;
      overlayX.value = -e.x + offset;
      overlayY.value = -e.y + offset - canvasHeight;

      notifyChange(currentPath);
    })
    .onEnd(() => {
      isCurrentlyDrawing.value = false;
      runOnJS(updatePaths)(currentPath.value);
    });

  const composed = Gesture.Simultaneous(tapDraw, panDraw);

  const magnifyViewStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: overlayX.value }, { translateY: overlayY.value }],
  }));

  const overlayViewStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    pointerEvents: 'none',
    top: 0,
    left: 0,
    width: OVERLAY_WIDTH,
    height: OVERLAY_WIDTH,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    opacity: isCurrentlyDrawing.value ? 1 : 0,
  }));

  const pointerInOverlayStyle = useAnimatedStyle(() => ({
    width: 30,
    height: 30,
    top: OVERLAY_WIDTH / 2 - 30 / 2,
    position: 'absolute',
    alignSelf: 'center',
  }));

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: canvasHeight,
          width: canvasWidth,
          position: 'relative',
        }}
      >
        <GestureDetector gesture={composed}>
          <Canvas
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: 'white',
            }}
            ref={ref}
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
                    {paths.map(path => (
                      <Path
                        key={path.id}
                        path={path.path}
                        style="stroke"
                        strokeWidth={path.strokeWidth}
                        strokeCap="round"
                        blendMode={path.blendMode as any}
                        strokeJoin="round"
                      />
                    ))}
                    <Path
                      path={currentPath}
                      style="stroke"
                      strokeWidth={30}
                      strokeCap="round"
                      blendMode={isDrawing ? 'color' : 'clear'}
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
        <Animated.View style={overlayViewStyle}>
          <View style={{ width: canvasWidth, height: canvasHeight }} />
          <Animated.View style={magnifyViewStyle}>
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
                      {paths.map(path => (
                        <Path
                          key={path.id}
                          path={path.path}
                          style="stroke"
                          strokeWidth={path.strokeWidth}
                          strokeCap="round"
                          blendMode={path.blendMode as any}
                          strokeJoin="round"
                        />
                      ))}
                      <Path
                        path={currentPath}
                        style="stroke"
                        strokeWidth={30}
                        strokeCap="round"
                        blendMode={isDrawing ? 'color' : 'clear'}
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
          </Animated.View>
          <Animated.View style={pointerInOverlayStyle}>
            <View
              style={{
                borderColor: 'blue',
                borderWidth: 3,
                borderStyle: 'dashed',
                width: 30,
                height: 30,
                borderRadius: 30,
                backgroundColor: '#ffffff73',
              }}
            />
          </Animated.View>
        </Animated.View>
      </View>
      <View
        style={{
          justifyContent: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        <Text>Erase</Text>
        <Switch value={isDrawing} onValueChange={setIsDrawing} />
        <Text>Draw</Text>
      </View>
      <Button title="Undo" onPress={undo} />
      <Button title="Redo" onPress={redo} />
    </View>
  );
}

export default Editor;
