import { Circle } from "lucide-react-native";
import * as React from "react";
import Svg, { G, Path } from "react-native-svg";

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