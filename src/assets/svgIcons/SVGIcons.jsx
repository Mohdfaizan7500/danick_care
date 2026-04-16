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

export const CalenderIcon = (props) => (
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

export const UsedQrCodeIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M200-400v-80h80v80h-80Zm-80-80v-80h80v80h-80Zm360-280v-80h80v80h-80ZM180-660h120v-120H180v120Zm-60 60v-240h240v240H120Zm60 420h120v-120H180v120Zm-60 60v-240h240v240H120Zm540-540h120v-120H660v120Zm-60 60v-240h240v240H600ZM360-400v-80h-80v-80h160v160h-80Zm40-200v-160h80v80h80v80H400Zm-190-90v-60h60v60h-60Zm0 480v-60h60v60h-60Zm480-480v-60h60v60h-60Zm-50 570v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z" />
  </Svg>
);


export const FreshQrCodeIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M40-120v-200h80v120h120v80H40Zm680 0v-80h120v-120h80v200H720ZM160-240v-480h80v480h-80Zm120 0v-480h40v480h-40Zm120 0v-480h80v480h-80Zm120 0v-480h120v480H520Zm160 0v-480h40v480h-40Zm80 0v-480h40v480h-40ZM40-640v-200h200v80H120v120H40Zm800 0v-120H720v-80h200v200h-80Z" />
  </Svg>
);

export const LinkQrCodeIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M318-120q-82 0-140-58t-58-140q0-40 15-76t43-64l134-133 56 56-134 134q-17 17-25.5 38.5T200-318q0 49 34.5 83.5T318-200q23 0 45-8.5t39-25.5l133-134 57 57-134 133q-28 28-64 43t-76 15Zm79-220-57-57 223-223 57 57-223 223Zm251-28-56-57 134-133q17-17 25-38t8-44q0-50-34-85t-84-35q-23 0-44.5 8.5T558-726L425-592l-57-56 134-134q28-28 64-43t76-15q82 0 139.5 58T839-641q0 39-14.5 75T782-502L648-368Z" />
  </Svg>
);

export const DownloadIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
  </Svg>
);

export const PendingIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e3e3e3"
    {...props}
  >
    <Path d="M440-600v-120H320v-80h120v-120h80v120h120v80H520v120h-80ZM223.5-103.5Q200-127 200-160t23.5-56.5Q247-240 280-240t56.5 23.5Q360-193 360-160t-23.5 56.5Q313-80 280-80t-56.5-23.5Zm400 0Q600-127 600-160t23.5-56.5Q647-240 680-240t56.5 23.5Q760-193 760-160t-23.5 56.5Q713-80 680-80t-56.5-23.5ZM40-800v-80h131l170 360h280l156-280h91L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68.5-39t-1.5-79l54-98-144-304H40Z" />
  </Svg>
);

export const OrderIcon = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipPath="url(#clip0_4103_623)">
      <Path
        d="M5.83325 17.5833C5.83325 18.0892 6.244 18.5 6.74992 18.5C7.25584 18.5 7.66659 18.0892 7.66659 17.5833C7.66659 17.0774 7.25584 16.6666 6.74992 16.6666C6.244 16.6666 5.83325 17.0774 5.83325 17.5833V17.5833"
        stroke="#6E6E6E"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}

      />
      <Path
        d="M16 17.5833C16 18.0892 16.4107 18.5 16.9167 18.5C17.4226 18.5 17.8333 18.0892 17.8333 17.5833C17.8333 17.0774 17.4226 16.6666 16.9167 16.6666C16.4107 16.6666 16 17.0774 16 17.5833Z"
        stroke="#6E6E6E"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}

      />
      <Path
        d="M1.70825 0.708313H3.54159L5.97992 12.0933C6.16443 12.9534 6.93382 13.5612 7.81325 13.5416H16.7783C17.6378 13.5403 18.381 12.9419 18.5658 12.1025L20.0783 5.29165H4.52242"
        stroke="#6E6E6E"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}

      />
    </G>
    <Defs>
      <ClipPath id="clip0_4103_623">
        <Rect width={20} height={20} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const CheckCircleIcon = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipPath="url(#clip0_984_46445)">
      <Path
        d="M18.159 8.32843C18.5394 10.1953 18.2683 12.1361 17.3909 13.8273C16.5135 15.5185 15.0828 16.8577 13.3375 17.6217C11.5922 18.3858 9.63772 18.5284 7.8 18.0258C5.96227 17.5232 4.35239 16.4057 3.23883 14.8598C2.12527 13.3139 1.57533 11.433 1.68073 9.53067C1.78613 7.62837 2.5405 5.8197 3.81803 4.40628C5.09556 2.99286 6.81904 2.06012 8.70104 1.76361C10.583 1.46711 12.5098 1.82475 14.16 2.77692"
        stroke="#00A63E"
        strokeWidth={1.66587}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}

      />
      <Path
        d="M7.49658 9.16257L9.99539 11.6614L18.3247 3.33203"
        stroke="#00A63E"
        strokeWidth={1.66587}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}

      />
    </G>
    <Defs>
      <ClipPath id="clip0_984_46445">
        <Rect width={19.9904} height={19.9904} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);



export const CrossCircleIcon = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M9.99536 18.3247C14.5955 18.3247 18.3247 14.5955 18.3247 9.99536C18.3247 5.39519 14.5955 1.66602 9.99536 1.66602C5.39519 1.66602 1.66602 5.39519 1.66602 9.99536C1.66602 14.5955 5.39519 18.3247 9.99536 18.3247Z"
      stroke="#99A1AF"
      strokeWidth={1.66587}
      strokeLinecap="round"
      strokeLinejoin="round"
    {...props}

    />
    <Path
      d="M12.4942 7.49609L7.49658 12.4937"
      stroke="#99A1AF"
      strokeWidth={1.66587}
      strokeLinecap="round"
      strokeLinejoin="round"
    {...props}

    />
    <Path
      d="M7.49658 7.49609L12.4942 12.4937"
      stroke="#99A1AF"
      strokeWidth={1.66587}
      strokeLinecap="round"
      strokeLinejoin="round"
    {...props}

    />
  </Svg>
);
