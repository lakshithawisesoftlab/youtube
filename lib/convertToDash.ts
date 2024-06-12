import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export const convertToDash = (inputPath: any, outputDir: any) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-preset fast",
        "-g 48",
        "-keyint_min 48",
        "-sc_threshold 0",
        "-profile:v main",
        "-use_template 1",
        "-use_timeline 1",
        "-b_strategy 0",
        "-bf 1",
        "-map 0",
        "-b:v 1000k",
        "-s 640x360",
        "-r 30",
        "-f dash",
      ])
      .output(path.join(outputDir, "manifest.mpd"))
      .on("end", () =>
        resolve(
          fs
            .readdirSync(outputDir)
            .map((file: any) => path.join(outputDir, file))
        )
      )
      .on("error", reject)
      .run();
  });
};
