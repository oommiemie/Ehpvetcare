/* รูปสินค้า (เว็บ-optimized) — import ให้ Vite bundle + ให้ url จริง */
import pd01 from "@/assets/product-web/PD-01.jpg";
import pd02 from "@/assets/product-web/PD-02.jpg";
import pd03 from "@/assets/product-web/PD-03.jpg";
import pd04 from "@/assets/product-web/PD-04.jpg";
import pd05 from "@/assets/product-web/PD-05.jpg";
import pd06 from "@/assets/product-web/PD-06.jpg";
import pd07 from "@/assets/product-web/PD-07.jpg";
import pd08 from "@/assets/product-web/PD-08.jpg";
import pd09 from "@/assets/product-web/PD-09.jpg";
import pd10 from "@/assets/product-web/PD-10.jpg";
import pd11 from "@/assets/product-web/PD-11.jpg";
import pd12 from "@/assets/product-web/PD-12.jpg";
import pd13 from "@/assets/product-web/PD-13.jpg";
import pd14 from "@/assets/product-web/PD-14.jpg";
import pd15 from "@/assets/product-web/PD-15.jpg";
import pd16 from "@/assets/product-web/PD-16.jpg";
import pd17 from "@/assets/product-web/PD-17.jpg";
import pd18 from "@/assets/product-web/PD-18.jpg";
import pd19 from "@/assets/product-web/PD-19.jpg";
import pd20 from "@/assets/product-web/PD-20.jpg";
import pd21 from "@/assets/product-web/PD-21.jpg";
import pd22 from "@/assets/product-web/PD-22.jpg";
import pd23 from "@/assets/product-web/PD-23.jpg";
import pd24 from "@/assets/product-web/PD-24.jpg";
import pd25 from "@/assets/product-web/PD-25.jpg";
import pd26 from "@/assets/product-web/PD-26.jpg";
import pd27 from "@/assets/product-web/PD-27.jpg";
import pd28 from "@/assets/product-web/PD-28.jpg";
import pd30 from "@/assets/product-web/PD-30.jpg";
import pd31 from "@/assets/product-web/PD-31.jpg";
import pd32 from "@/assets/product-web/PD-32.jpg";
import pd33 from "@/assets/product-web/PD-33.jpg";
import pd34 from "@/assets/product-web/PD-34.jpg";
import pd35 from "@/assets/product-web/PD-35.jpg";
import pd36 from "@/assets/product-web/PD-36.jpg";
import pd37 from "@/assets/product-web/PD-37.jpg";
import pd38 from "@/assets/product-web/PD-38.jpg";
import pd39 from "@/assets/product-web/PD-39.jpg";
import pd40 from "@/assets/product-web/PD-40.jpg";
import pd41 from "@/assets/product-web/PD-41.jpg";
import pd42 from "@/assets/product-web/PD-42.jpg";
import pd43 from "@/assets/product-web/PD-43.jpg";
import pd44 from "@/assets/product-web/PD-44.jpg";
import pd45 from "@/assets/product-web/PD-45.jpg";
import pd46 from "@/assets/product-web/PD-46.jpg";
import pd47 from "@/assets/product-web/PD-47.jpg";
import pd48 from "@/assets/product-web/PD-48.jpg";
import pd49 from "@/assets/product-web/PD-49.jpg";
import pd50 from "@/assets/product-web/PD-50.jpg";
import pd51 from "@/assets/product-web/PD-51.jpg";
import pd52 from "@/assets/product-web/PD-52.jpg";
import pd53 from "@/assets/product-web/PD-53.jpg";
import pd54 from "@/assets/product-web/PD-54.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  "PD-01": pd01,
  "PD-02": pd02,
  "PD-03": pd03,
  "PD-04": pd04,
  "PD-05": pd05,
  "PD-06": pd06,
  "PD-07": pd07,
  "PD-08": pd08,
  "PD-09": pd09,
  "PD-10": pd10,
  "PD-11": pd11,
  "PD-12": pd12,
  "PD-13": pd13,
  "PD-14": pd14,
  "PD-15": pd15,
  "PD-16": pd16,
  "PD-17": pd17,
  "PD-18": pd18,
  "PD-19": pd19,
  "PD-20": pd20,
  "PD-21": pd21,
  "PD-22": pd22,
  "PD-23": pd23,
  "PD-24": pd24,
  "PD-25": pd25,
  "PD-26": pd26,
  "PD-27": pd27,
  "PD-28": pd28,
  "PD-30": pd30,
  "PD-31": pd31,
  "PD-32": pd32,
  "PD-33": pd33,
  "PD-34": pd34,
  "PD-35": pd35,
  "PD-36": pd36,
  "PD-37": pd37,
  "PD-38": pd38,
  "PD-39": pd39,
  "PD-40": pd40,
  "PD-41": pd41,
  "PD-42": pd42,
  "PD-43": pd43,
  "PD-44": pd44,
  "PD-45": pd45,
  "PD-46": pd46,
  "PD-47": pd47,
  "PD-48": pd48,
  "PD-49": pd49,
  "PD-50": pd50,
  "PD-51": pd51,
  "PD-52": pd52,
  "PD-53": pd53,
  "PD-54": pd54,
};

export const productImg = (pd: string): string => PRODUCT_IMAGES[pd] ?? "";
