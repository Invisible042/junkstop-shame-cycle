import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define the navigation param list for type safety
// You may want to move this to a central types file if you have one
export type RootStackParamList = {
  VideoPreview: { localUri: string };
  // ... other screens
};

type Props = NativeStackScreenProps<RootStackParamList, 'VideoPreview'>;

export default function VideoPreviewScreen({ route, navigation }: Props) {
  const { localUri } = route.params;

  const handleShare = async () => {
    await Sharing.shareAsync(localUri);
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: localUri }}
        style={{ width: '100%', height: 400 }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
      />
      <Button title="Share Video" onPress={handleShare} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
}); 