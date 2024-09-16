import styles from "./index.module.css";
import { Theme } from "./Theme";

export const ThemeList = () => {
  return (
    <div className={styles.wrapper}>
      <Theme title="1" colors={["#1BD0C8"]} />
      <Theme title="2" colors={["#1BD0C8", "#FAC42D"]} />
      <Theme title="3" colors={["#1BD0C8", "#FAC42D", "#E54459"]} />
      <Theme title="4" colors={["#1BD0C8", "#FAC42D", "#A6D930", "#E54459"]} />
      <Theme
        title="5"
        colors={["#1BD0C8", "#FAC42D", "#A6D930", "#E54459", "#4F48C4"]}
      />
      <Theme
        title="6"
        colors={[
          "#1BD0C8",
          "#FAC42D",
          "#A6D930",
          "#E54459",
          "#4F48C4",
          "#AF56B3",
        ]}
      />
      <Theme
        title="7"
        colors={[
          "#1BD0C8",
          "#FAC42D",
          "#A6D930",
          "#E54459",
          "#4F48C4",
          "#AF56B3",
          "#F58D3D",
        ]}
      />
      <Theme
        title="8"
        colors={[
          "#1BD0C8",
          "#FAC42D",
          "#A6D930",
          "#E54459",
          "#4F48C4",
          "#AF56B3",
          "#F58D3D",
          "#1D99E8",
        ]}
      />
      <Theme
        title="9"
        colors={[
          "#1BD0C8",
          "#FAC42D",
          "#A6D930",
          "#E54459",
          "#4F48C4",
          "#AF56B3",
          "#F58D3D",
          "#1D99E8",
          "#123456",
        ]}
      />
    </div>
  );
};
