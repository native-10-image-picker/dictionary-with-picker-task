import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";

import { wordsLearningActions } from "../../store/wordsLearningSlice";
import { playSound } from "../../services/soundHandler";

function EditWord({ route, navigation }) {
  const initialWordData = route.params.wordData;

  const [wordData, setWordData] = useState(() => {
    const imageUri =
      initialWordData.imageUri ?? initialWordData.image;

    return {
      ...initialWordData,
      imageUri,
      image: imageUri,
    };
  });

  const [permission, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const colors = useSelector((state) => state.theme.colors);
  const styles = useMemo(() => getStyles(colors), [colors]);
  const dispatch = useDispatch();

  function onSave() {
    dispatch(wordsLearningActions.updateWord(wordData));
    navigation.navigate("AllWords");
  }

  function onChangeWordData(text, propName) {
    setWordData((previousData) => ({
      ...previousData,
      [propName]: text,
    }));
  }

  async function pickImageHandler() {
    try {
      let permissionResult = permission;

      if (!permissionResult?.granted) {
        permissionResult = await requestPermission();
      }

      if (!permissionResult?.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;

        setWordData((previousData) => ({
          ...previousData,
          imageUri: uri,
          image: uri,
        }));
      }
    } catch (error) {
      console.warn("Could not select image:", error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.receivedInfoContainer}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{wordData.word}</Text>

          {wordData.audio ? (
            <Pressable
              style={styles.playPressable}
              onPress={() => playSound(wordData.audio)}
            >
              <Ionicons
                name="volume-medium-outline"
                size={28}
                color={colors.primary900}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.imageSection}>
          {wordData.imageUri ? (
            <Image
              source={{ uri: wordData.imageUri }}
              style={styles.image}
            />
          ) : (
            <Pressable onPress={pickImageHandler}>
              <Text style={styles.placeholderText}>
                No image taken yet.
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.imageButton}
            onPress={pickImageHandler}
          >
            <Text style={styles.imageButtonText}>
              {wordData.imageUri ? "Change Image" : "Select Image"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.fieldsRow}>
          <View style={styles.field}>
            <Text style={styles.label}>phonetics:</Text>
            <TextInput
              value={wordData.phonetics || ""}
              style={styles.input}
              onChangeText={(text) =>
                onChangeWordData(text, "phonetics")
              }
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>part of speech:</Text>
            <TextInput
              style={styles.input}
              value={wordData.partOfSpeech || ""}
              onChangeText={(text) =>
                onChangeWordData(text, "partOfSpeech")
              }
            />
          </View>
        </View>

        <Text style={styles.label}>meaning:</Text>
        <TextInput
          style={[styles.input, styles.meaningInput]}
          multiline
          numberOfLines={4}
          onChangeText={(text) =>
            onChangeWordData(text, "meaning")
          }
          value={wordData.meaning || ""}
          textAlignVertical="top"
        />

        {wordData.word ? (
          <Pressable
            style={styles.buttonContainer}
            onPress={onSave}
          >
            <Text style={styles.actionButtonText}>Save</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      paddingBottom: 20,
    },
    receivedInfoContainer: {
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    wordRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    word: {
      fontSize: 32,
      paddingHorizontal: 10,
      color: colors.fontMain,
    },
    fieldsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    field: {
      flex: 1,
    },
    input: {
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 6,
      borderColor: colors.primary200,
      color: colors.fontMain,
      minHeight: 40,
    },
    meaningInput: {
      minHeight: 100,
    },
    label: {
      fontSize: 12,
      color: colors.grey600,
      marginBottom: 4,
      paddingTop: 10,
    },
    imageSection: {
      alignItems: "center",
      marginVertical: 15,
    },
    image: {
      width: 150,
      height: 150,
      borderRadius: 8,
      marginBottom: 10,
    },
    placeholderText: {
      fontSize: 16,
      color: colors.grey600,
      marginBottom: 10,
      fontStyle: "italic",
    },
    imageButton: {
      backgroundColor: colors.primary200,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
    },
    imageButtonText: {
      fontSize: 16,
      color: colors.fontMain,
    },
    buttonContainer: {
      borderRadius: 4,
      backgroundColor: colors.primary900,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 14,
    },
    actionButtonText: {
      fontSize: 24,
      color: colors.fontInverse,
    },
    playPressable: {
      marginHorizontal: 20,
    },
  });
}

export default EditWord;