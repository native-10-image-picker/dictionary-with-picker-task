import { render, screen, userEvent, act } from "@testing-library/react-native";

import { Provider } from "react-redux";
import store from "../store";
import * as constants from "../constants";
import words from "./testData";
import MainNavigator from "../navigators/MainNavigator";
import * as wordsService from "../services/wordsHandler";
import * as allFromImagePicker from "expo-image-picker";

jest.mock("expo-image-picker", () => {
  const actual = jest.requireActual("expo-image-picker");
  return {
    ...actual,
    useMediaLibraryPermissions: jest.fn(() => {
      const requestPermission = () => {
        return Promise.resolve({ granted: true });
      };
      return [
        { status: actual.PermissionStatus.UNDETERMINED },
        requestPermission,
      ];
    }),
    launchImageLibraryAsync: jest.fn((param) => {
      return { canceled: true };
    }),
  };
});

constants.INITIAL_FORGETTING_SPAN = 1000 / 2;
constants.REFRESH_STATUSES_SPAN = 1000;

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  jest.resetAllMocks();
});

jest.mock("@expo/vector-icons/Ionicons", () => {
  const { Text } = require("react-native");
  return ({ name }) => <Text>{name}</Text>;
});

test(`image picker is used correctly on AddWord screen, 
and selected image uri is not stored in the store if user cancells selection`, async () => {
  jest.useFakeTimers();
  jest
    .spyOn(wordsService, "getWordInfo")
    .mockImplementationOnce(() => words[0]);

  const user = userEvent.setup();

  render(
    <Provider store={store}>
      <MainNavigator />
    </Provider>
  );

  let plusText = screen.getByText("add-outline");
  await act(async () => {
    user.press(plusText);
    jest.advanceTimersByTime(50);
  });

  expect(allFromImagePicker.useMediaLibraryPermissions).toHaveBeenCalled();

  const imagePlaceholderText = screen.getByText("No image taken yet.");
  await act(async () => {
    await user.press(imagePlaceholderText);
    jest.advanceTimersByTime(50);
  });
  expect(allFromImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();

  const input = screen.getByPlaceholderText("type here..");
  await act(async () => {
    await user.type(input, "hello");
    jest.advanceTimersByTime(2050);
  });
  await act(async () => {
    await user.press(imagePlaceholderText);
    jest.advanceTimersByTime(50);
  });
  expect(allFromImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  const addWordButton = await screen.findByText("Add");
  await act(async () => {
    await user.press(addWordButton);
    jest.advanceTimersByTime(50);
  });

  expect(store.getState().wordsLearning.words[0].image).not.toBeDefined();
});
