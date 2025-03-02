"use client";

import classNames from "classnames";

import styles from "./index.module.css";

interface Props {
  colors: string[];
}

export const Preview = ({ colors }: Props) => {
  const colorsCount = colors.length;

  return (
    <div className={styles.preview}>
      {(() => {
        switch (colorsCount) {
          case 1:
            return (
              <div
                className={classNames(styles.w_full, styles.h_full)}
                style={{ backgroundColor: `${colors[0]}` }}
              />
            );
          case 2:
            return (
              <>
                <div
                  className={classNames(styles.w_half, styles.h_full)}
                  style={{ backgroundColor: `${colors[0]}` }}
                />
                <div
                  className={classNames(styles.w_half, styles.h_full)}
                  style={{ backgroundColor: `${colors[1]}` }}
                />
              </>
            );
          case 3:
            return (
              <>
                <div
                  className={classNames(styles.w_27, styles.h_full)}
                  style={{ backgroundColor: `${colors[0]}` }}
                />
                <div
                  className={classNames(styles.w_27, styles.h_full)}
                  style={{ backgroundColor: `${colors[1]}` }}
                />
                <div
                  className={classNames(styles.w_27, styles.h_full)}
                  style={{ backgroundColor: `${colors[2]}` }}
                />
              </>
            );
          case 4:
            return (
              <>
                <div
                  className={classNames(styles.w_27, styles.h_full)}
                  style={{ backgroundColor: `${colors[0]}` }}
                />
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_27, styles.h_half)}
                    style={{ backgroundColor: `${colors[1]}` }}
                  />
                  <div
                    className={classNames(styles.w_27, styles.h_half)}
                    style={{ backgroundColor: `${colors[2]}` }}
                  />
                </div>

                <div
                  className={classNames(styles.w_27, styles.h_full)}
                  style={{ backgroundColor: `${colors[3]}` }}
                />
              </>
            );
          case 5:
            return (
              <>
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_27, styles.h_half)}
                    style={{ backgroundColor: `${colors[0]}` }}
                  />
                  <div
                    className={classNames(styles.w_27, styles.h_half)}
                    style={{ backgroundColor: `${colors[1]}` }}
                  />
                </div>
                <div
                  className={classNames(styles.w_27, styles.h_full)}
                  style={{ backgroundColor: `${colors[2]}` }}
                />
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_27, styles.h_half)}
                    style={{ backgroundColor: `${colors[3]}` }}
                  />
                  <div
                    className={classNames(styles.w_27, styles.h_half)}
                    style={{ backgroundColor: `${colors[4]}` }}
                  />
                </div>
              </>
            );
          case 6:
            return (
              <>
                <div
                  className={classNames(styles.w_20, styles.h_full)}
                  style={{ backgroundColor: `${colors[0]}` }}
                />
                <div
                  className={classNames(
                    styles.w_20,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[1]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[2]}` }}
                  />
                </div>
                <div
                  className={classNames(
                    styles.w_20,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[3]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[4]}` }}
                  />
                </div>
                <div
                  className={classNames(styles.w_20, styles.h_full)}
                  style={{ backgroundColor: `${colors[5]}` }}
                />
              </>
            );
          case 7:
            return (
              <>
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[0]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[1]}` }}
                  />
                </div>
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[2]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[3]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[4]}` }}
                  />
                </div>
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[5]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[6]}` }}
                  />
                </div>
              </>
            );
          case 8:
            return (
              <>
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[0]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[1]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[2]}` }}
                  />
                </div>
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[3]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[4]}` }}
                  />
                </div>
                <div
                  className={classNames(
                    styles.w_27,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[5]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[6]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[7]}` }}
                  />
                </div>
              </>
            );
          case 9:
            return (
              <>
                <div
                  className={classNames(styles.w_20, styles.h_full)}
                  style={{ backgroundColor: `${colors[0]}` }}
                />
                <div
                  className={classNames(
                    styles.w_20,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_26)}
                    style={{ backgroundColor: `${colors[1]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_28)}
                    style={{ backgroundColor: `${colors[2]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_24)}
                    style={{ backgroundColor: `${colors[3]}` }}
                  />
                </div>
                <div
                  className={classNames(
                    styles.w_20,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_18)}
                    style={{ backgroundColor: `${colors[4]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_27)}
                    style={{ backgroundColor: `${colors[5]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_33)}
                    style={{ backgroundColor: `${colors[6]}` }}
                  />
                </div>
                <div
                  className={classNames(
                    styles.w_20,
                    styles.h_full,
                    styles.flex_c
                  )}
                >
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[7]}` }}
                  />
                  <div
                    className={classNames(styles.w_full, styles.h_half)}
                    style={{ backgroundColor: `${colors[8]}` }}
                  />
                </div>
              </>
            );
          default:
            return (
              <div
                className={classNames(styles.w_full, styles.h_full)}
                style={{ backgroundColor: `${colors[0]}` }}
              />
            );
        }
      })()}
    </div>
  );
};
