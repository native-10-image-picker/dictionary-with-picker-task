import { render, screen, userEvent, act } from "@testing-library/react-native";
import { Image } from "react-native";
import { Provider } from "react-redux";

import store from "../store";
import { wordsLearningActions } from "../store/wordsLearningSlice";
import * as constants from "../constants";
import words from "./testData";
import MainNavigator from "../navigators/MainNavigator";
import * as allFromImagePicker from "expo-image-picker";

constants.INITIAL_FORGETTING_SPAN = 1000 / 2;
constants.REFRESH_STATUSES_SPAN = 1000;

jest.mock("expo-image-picker", () => {
  const actual = jest.requireActual("expo-image-picker");
  return {
    ...actual,
    useMediaLibraryPermissions: jest.fn(() => {
      const requestPermission = () => {
        console.log("request permission called");
        return Promise.resolve({
          granted: true,
          status: actual.PermissionStatus.GRANTED,
        });
      };
      return [
        { status: actual.PermissionStatus.UNDETERMINED },
        requestPermission,
      ];
    }),
    launchImageLibraryAsync: jest.fn((param) => {
      return { assets: [{ uri: "some_test_uri" }], cancelled: false };
    }),
  };
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  jest.resetAllMocks();
});

test(`image picker is used correctly on EditWord screen, 
and selected image uri is stored in the store`, async () => {
  jest.useFakeTimers();
  const user = userEvent.setup();
  await act(async () => {
    store.dispatch(wordsLearningActions.addWord(words[0]));
  });

  render(
    <Provider store={store}>
      <MainNavigator />
    </Provider>
  );

  let wordText = screen.getByText(words[0].word);
  await act(async () => {
    user.press(wordText);
    jest.advanceTimersByTime(50);
  });

  const explanationInput = screen.getByDisplayValue(
    "used as a greeting or to begin a phone conversation."
  );

  const newExplanationValue = "new explanation";
  await act(async () => {
    await user.clear(explanationInput);
    await user.type(explanationInput, newExplanationValue);
    jest.advanceTimersByTime(50);
  });

  const imagePlaceholderText = screen.getByText("No image taken yet.");
  await act(async () => {
    await user.press(imagePlaceholderText);
    jest.advanceTimersByTime(50);
  });
  expect(allFromImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  const saveButton = await screen.findByText("Save");
  await act(async () => {
    await user.press(saveButton);
    jest.advanceTimersByTime(50);
  });

  expect(store.getState().wordsLearning.words[0].meaning).toEqual(
    newExplanationValue
  );
  expect(store.getState().wordsLearning.words[0].image).toEqual(
    "some_test_uri"
  );

  wordText = screen.getByText(words[0].word);
  await act(async () => {
    user.press(wordText);
    jest.advanceTimersByTime(50);
  });

  const images = screen.UNSAFE_getAllByType(Image);
  expect(images[1].props.source).toEqual({ uri: "some_test_uri" });
});
