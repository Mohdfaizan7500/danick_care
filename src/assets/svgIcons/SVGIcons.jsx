import { Circle } from "lucide-react-native";
import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export const HomeIcon = ({ color = "#6E6E6E", size = 20, ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12.5 17.5V10.8333C12.5 10.3731 12.1269 10 11.6667 10H8.33333C7.8731 10 7.5 10.3731 7.5 10.8333V17.5"
      stroke={color}
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M2.5 8.33333C2.49988 7.8426 2.71603 7.37676 3.09083 7.05999L8.92417 2.05999C9.54532 1.53502 10.4547 1.53502 11.0758 2.05999L16.9092 7.05999C17.284 7.37676 17.5001 7.8426 17.5 8.33333V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V8.33333"
      stroke={color}
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
  </Svg>
);

export const ProfileIcon = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M15.8333 17.5V15.8333C15.8333 13.9924 14.3409 12.5 12.5 12.5H7.49996C5.65901 12.5 4.16663 13.9924 4.16663 15.8333V17.5"
      stroke="#6E6E6E"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M6.66663 5.83333C6.66663 7.67305 8.16024 9.16667 9.99996 9.16667C11.8397 9.16667 13.3333 7.67305 13.3333 5.83333C13.3333 3.99362 11.8397 2.5 9.99996 2.5C8.16024 2.5 6.66663 3.99362 6.66663 5.83333V5.83333"
      stroke="#6E6E6E"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
  </Svg>
);

export const PartIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M686-132 444-376q-20 8-40.5 12t-43.5 4q-100 0-170-70t-70-170q0-36 10-68.5t28-61.5l146 146 72-72-146-146q29-18 61.5-28t68.5-10q100 0 170 70t70 170q0 23-4 43.5T584-516l244 242q12 12 12 29t-12 29l-84 84q-12 12-29 12t-29-12Zm29-85 27-27-256-256q18-20 26-46.5t8-53.5q0-60-38.5-104.5T386-758l74 74q12 12 12 28t-12 28L332-500q-12 12-28 12t-28-12l-74-74q9 57 53.5 95.5T360-440q26 0 52-8t47-25l256 256ZM472-488Z" />
  </Svg>
);

export const ScanIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-scan-barcode-icon lucide-scan-barcode"
    {...props}
  >
    <Path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <Path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <Path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <Path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <Path d="M8 7v10" />
    <Path d="M12 7v10" />
    <Path d="M17 7v10" />
  </Svg>
);

export const PartsIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-shovel-icon lucide-shovel"
    {...props}
  >
    <Path d="M21.56 4.56a1.5 1.5 0 0 1 0 2.122l-.47.47a3 3 0 0 1-4.212-.03 3 3 0 0 1 0-4.243l.44-.44a1.5 1.5 0 0 1 2.121 0z" />
    <Path d="M3 22a1 1 0 0 1-1-1v-3.586a1 1 0 0 1 .293-.707l3.355-3.355a1.205 1.205 0 0 1 1.704 0l3.296 3.296a1.205 1.205 0 0 1 0 1.704l-3.355 3.355a1 1 0 0 1-.707.293z" />
    <Path d="m9 15 7.879-7.878" />
  </Svg>
);

export const ComplaintsIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z" />
  </Svg>
);

export const CompleteIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M480-480Zm195-195q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35ZM324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880q28 0 55.5 4t54.5 12q-11 17-18 36.5T562-788q-20-6-40.5-9t-41.5-3q-134 0-227 93t-93 227q0 134 93 227t227 93q134 0 227-93t93-227q0-21-3-41.5t-9-40.5q20-3 39.5-10t36.5-18q8 27 12 54.5t4 55.5q0 83-31.5 156T763-197q-54 54-127 85.5T480-80q-83 0-156-31.5ZM423-296l273-273q-20-7-37.5-17.5T625-611L424-410 310-522l-56 56 169 170Z" />
  </Svg>
);

export const BucketIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M269-120q-30 0-52-20t-27-49l-70-491h120v-80q0-33 23.5-56.5T320-840h320q33 0 56.5 23.5T720-760v80h120l-70 491q-5 29-27.5 49T690-120H269Zm-57-480 57 400h422l57-400H212Zm226 320 198-198-57-56-141 141-57-57-57 57 114 113ZM320-680h320v-80H320v80Zm160 280Z" />
  </Svg>
);

export const AMCIcon = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M7.49996 1.66666H12.5C12.9602 1.66666 13.3333 2.03976 13.3333 2.5V4.16666C13.3333 4.6269 12.9602 5 12.5 5H7.49996C7.03972 5 6.66663 4.6269 6.66663 4.16666V2.5C6.66663 2.03976 7.03972 1.66666 7.49996 1.66666V1.66666"
      stroke="#6E6E6E"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M13.3334 3.33334H15C15.9205 3.33334 16.6667 4.07953 16.6667 5V16.6667C16.6667 17.5871 15.9205 18.3333 15 18.3333H5.00004C4.07957 18.3333 3.33337 17.5871 3.33337 16.6667V5C3.33337 4.07953 4.07957 3.33334 5.00004 3.33334H6.66671M10 9.16667H13.3334M10 13.3333H13.3334M6.66671 9.16667H6.67504M6.66671 13.3333H6.67504"
      stroke="#6E6E6E"
      strokeWidth={1.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
  </Svg>
);

export const CalanderIcon = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M6.66992 1.66992L6.66992 4.98992"
      stroke="#251D18"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M13.3301 1.66992V4.98992"
      stroke="#251D18"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M15.8103 3.35938L4.19027 3.35938C3.27348 3.35938 2.53027 4.10258 2.53027 5.01937L2.53027 16.6394C2.53027 17.5562 3.27348 18.2994 4.19027 18.2994L15.8103 18.2994C16.7271 18.2994 17.4703 17.5562 17.4703 16.6394L17.4703 5.01937C17.4703 4.10258 16.7271 3.35938 15.8103 3.35938Z"
      stroke="#251D18"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M2.53027 8.33008L17.4703 8.33008"
      stroke="#251D18"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
  </Svg>
);

export const UserIcon = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M19 21V19C19 16.7923 17.2077 15 15 15H9C6.79234 15 5 16.7923 5 19V21"
      stroke="#659C16"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M8 7C8 9.20766 9.79234 11 12 11C14.2077 11 16 9.20766 16 7C16 4.79234 14.2077 3 12 3C9.79234 3 8 4.79234 8 7V7"
      stroke="#659C16"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
  </Svg>
);

export const SupportIcon = (props) => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipPath="url(#clip0_2814_845)">
      <Path
        d="M1.5 9C1.5 13.1394 4.86064 16.5 9 16.5C13.1394 16.5 16.5 13.1394 16.5 9C16.5 4.86064 13.1394 1.5 9 1.5C4.86064 1.5 1.5 4.86064 1.5 9V9"
        stroke="#1C1C1C"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}

      />
      <Path
        d="M6.81738 6.7499C7.18146 5.71494 8.23892 5.09346 9.32027 5.27894C10.4016 5.46442 11.1915 6.40277 11.1899 7.4999C11.1899 8.9999 8.93988 9.7499 8.93988 9.7499M8.99988 12.7499H9.00738"
        stroke="#1C1C1C"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}

      />
    </G>
    <Defs>
      <ClipPath id="clip0_2814_845">
        <Rect width={18} height={18} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const FileIcon = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12.4894 1.69922L5.01937 1.69922C4.10258 1.69922 3.35938 2.44243 3.35937 3.35922L3.35937 16.6392C3.35937 17.556 4.10258 18.2992 5.01937 18.2992L14.9794 18.2992C15.8962 18.2992 16.6394 17.556 16.6394 16.6392L16.6394 5.84922L12.4894 1.69922Z"
      stroke="#2B2929"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M11.6797 1.67969V4.99969C11.6797 5.91648 12.4229 6.65969 13.3397 6.65969L16.6597 6.65969"
      stroke="#2B2929"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M8.32992 7.5H6.66992"
      stroke="#2B2929"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M13.3197 10.8301L6.67969 10.8301"
      stroke="#2B2929"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
    <Path
      d="M13.3197 14.1699L6.67969 14.1699"
      stroke="#2B2929"
      strokeWidth={1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}

    />
  </Svg>
);

export const ReplaceIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M440-82q-76-8-141.5-41.5t-114-87Q136-264 108-333T80-480q0-91 36.5-168T216-780h-96v-80h240v240h-80v-109q-55 44-87.5 108.5T160-480q0 123 80.5 212.5T440-163v81Zm-17-214L254-466l56-56 113 113 227-227 56 57-283 283Zm177 196v-240h80v109q55-45 87.5-109T800-480q0-123-80.5-212.5T520-797v-81q152 15 256 128t104 270q0 91-36.5 168T744-180h96v80H600Z" />
  </Svg>
);

export const TermsIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z" />
  </Svg>
);