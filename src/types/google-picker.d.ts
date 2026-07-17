export {};

declare global {
  interface Window {
    gapi?: {
      load: (module: string, callback: () => void) => void;
    };
    google?: {
      picker: {
        Action: { PICKED: string };
        DocsView: new () => {
          setMimeTypes: (mimeTypes: string) => unknown;
          setIncludeFolders: (included: boolean) => unknown;
          setParent: (parentId: string) => unknown;
          setSelectFolderEnabled: (enabled: boolean) => unknown;
        };
        Feature: { MULTISELECT_ENABLED: string };
        PickerBuilder: new () => GooglePickerBuilder;
      };
    };
  }

  interface GooglePickerBuilder {
    addView: (view: unknown) => GooglePickerBuilder;
    build: () => { setVisible: (isVisible: boolean) => void };
    enableFeature: (feature: string) => GooglePickerBuilder;
    setCallback: (
      callback: (data: {
        action?: string;
        docs?: Array<{ id?: string; name?: string }>;
      }) => void,
    ) => GooglePickerBuilder;
    setAppId: (appId: string) => GooglePickerBuilder;
    setDeveloperKey: (key: string) => GooglePickerBuilder;
    setOAuthToken: (token: string) => GooglePickerBuilder;
    setOrigin: (origin: string) => GooglePickerBuilder;
  }
}
