import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";

import { wordsLearningActions } from "../../store/wordsLearningSlice";
import { getWordInfo } from "../../services/wordsHandler";
import { playSound } from "../../services/soundHandler";

function AddWord({ navigation }) {
  const [text, setText] = useState("");
  const [wordData, setWordData] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  const [permission, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const colors = useSelector((state) => state.theme.colors);
  const styles = useMemo(() => getStyles(colors), [colors]);
  const dispatch = useDispatch();

  function onChangeText(typedText) {
    setWordData(null);
    setImageUri(null);
    setText(typedText);
  }

  useEffect(() => {
    let isActive = true;

    const timeout = setTimeout(async () => {
      const searchText = text.trim();

      if (!searchText) {
        setWordData(null);
        return;
      }

      try {
        const receivedWord = await getWordInfo(searchText);

        if (isActive) {
          setWordData(receivedWord || null);
        }
      } catch {
        if (isActive) {
          setWordData(null);
        }
      }
    }, 1000);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [text]);

  useEffect(() => {
    navigation.setOptions({
      title: wordData?.word
        ? `Adding word "${wordData.word}"`
        : "Adding word",
    });
  }, [navigation, wordData]);

  async function pickImageHandler() {
    if (!wordData?.word) return;

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
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn("Could not select image:", error);
    }
  }

  function onAdd() {
    if (!wordData?.word) return;

    dispatch(
      wordsLearningActions.addWord({
        ...wordData,
        imageUri: imageUri || null,
      })
    );

    navigation.navigate("AllWords");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your word to search:</Text>

        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
          placeholder="type here.."
          placeholderTextColor={colors.grey600}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.receivedInfoContainer}>
        {wordData?.word ? (
          <>
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

              <Text style={styles.phonetics}>
                {wordData.phonetics}
              </Text>
            </View>

            <Text style={styles.partOfSpeech}>
              {wordData.partOfSpeech}
            </Text>

            <Text style={styles.meaning}>{wordData.meaning}</Text>
          </>
        ) : text.trim().length > 0 ? (
          <Text style={styles.searchMessage}>
            Searching for word...
          </Text>
        ) : null}

        <View style={styles.imageSection}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
            />
          ) : (
            <Pressable
              onPress={pickImageHandler}
              disabled={!wordData?.word}
              accessibilityRole="button"
            >
              <Text style={styles.placeholderText}>
                No image taken yet.
              </Text>
            </Pressable>
          )}

          {wordData?.word ? (
            <Pressable
              style={styles.imageButton}
              onPress={pickImageHandler}
            >
              <Text style={styles.imageButtonText}>
                {imageUri ? "Change Image" : "Select Image"}
              </Text>
            </Pressable>
          ) : null}

          {imageUri && wordData?.word ? (
            <Pressable
              style={styles.imageButton}
              onPress={pickImageHandler}
            >
              <Text style={styles.imageButtonText}>
                Change Image
              </Text>
            </Pressable>
          ) : null}
        </View>

        {wordData?.word ? (
          <Pressable
            style={styles.buttonContainer}
            onPress={onAdd}
          >
            <Text style={styles.actionButtonText}>Add</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { paddingBottom: 20 },
    input: {
      height: 40,
      fontSize: 18,
      borderColor: colors.primary200,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      color: colors.fontMain,
    },
    label: {
      fontSize: 12,
      color: colors.grey600,
      marginBottom: 4,
    },
    inputContainer: { marginHorizontal: 12, marginTop: 10 },
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
    phonetics: {
      fontSize: 20,
      paddingHorizontal: 10,
      color: colors.fontMain,
    },
    partOfSpeech: {
      fontSize: 20,
      paddingHorizontal: 10,
      color: colors.fontMain,
    },
    meaning: {
      fontSize: 16,
      padding: 13,
      color: colors.fontMain,
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
      marginTop: 8,
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
      marginTop: 10,
    },
    actionButtonText: {
      fontSize: 24,
      color: colors.fontInverse,
    },
    playPressable: { marginHorizontal: 10 },
    searchMessage: {
      fontSize: 16,
      color: colors.grey600,
      padding: 15,
    },
  });
}

export default AddWord;