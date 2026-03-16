import svgPaths from "./svg-wzp4lylxew";
import imgImageMilkBone from "figma:asset/e9b1fefeea55cc411dc9eb327bda9f7456c08773.png";
import imgImageFurminator from "figma:asset/505f6de6b9c8099c4ad1a0bff44506bbe031dbd0.png";
import imgImageC60 from "figma:asset/5f96fa82449e32b4ba3d7fbeda1750f5d82d5ef7.png";
import imgImageS from "figma:asset/7d7b1e2f13104fd2e9b57cbefa94722d18204875.png";
import imgImageLeatherPremium from "figma:asset/ff32f37c92217575b24f56642fb3f6019ab8f4e0.png";
import imgImageCustom from "figma:asset/3f81500f5d618a3d6c608d334692429acae559eb.png";
import imgImage from "figma:asset/16446396803737633df776a955ae7469371138ae.png";

function Text() {
  return (
    <div className="h-[16.896px] relative shrink-0 w-[76.864px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16.9px] left-0 not-italic text-[#1e2939] text-[13px] top-[-0.53px] whitespace-nowrap">สพ.ญ. อรพิน</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[13.196px] relative shrink-0 w-[49.422px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[13.2px] left-0 not-italic text-[#99a1af] text-[11px] top-[-0.53px] whitespace-nowrap">สัตวแพทย์</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[30.093px] relative shrink-0 w-[76.864px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end relative size-full">
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[16.985px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-0 not-italic text-[12px] text-white top-[0.1px] whitespace-nowrap">สพ</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 size-[31.992px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(25, 165, 137) 0%, rgb(13, 124, 102) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[7.498px] pr-[7.508px] relative size-full">
        <Text2 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex gap-[7.993px] h-[31.992px] items-center left-[43.99px] top-[2px] w-[116.849px]" data-name="Container">
      <Container3 />
      <Container4 />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[8px] size-[19.993px] top-[8px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9925 19.9925">
        <g clipPath="url(#clip0_206_9436)" id="Icon">
          <path d={svgPaths.p5cefe80} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          <path d={svgPaths.p18fa6500} id="Vector_2" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
        </g>
        <defs>
          <clipPath id="clip0_206_9436">
            <rect fill="white" height="19.9925" width="19.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text3() {
  return <div className="absolute bg-[#ff6900] left-[22.01px] rounded-[21243700px] size-[7.993px] top-[5.99px]" data-name="Text" />;
}

function Button() {
  return (
    <div className="absolute left-0 rounded-[10px] size-[35.998px] top-0" data-name="Button">
      <Icon />
      <Text3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[35.998px] relative shrink-0 w-[160.84px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container2 />
        <Button />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white h-[55.991px] relative shrink-0 w-[1154.115px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-[0.633px] pl-[969.276px] relative size-full">
        <Container1 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[35.998px] left-0 top-0 w-[149.781px]" data-name="Heading 1">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[36px] left-0 not-italic text-[#101828] text-[24px] top-[0.1px] whitespace-nowrap">{`ร้านค้า & POS`}</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[16px] size-[13.998px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d={svgPaths.pae04d00} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M10.4983 9.91505V5.24915" id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M7.5821 9.91505V2.91619" id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M4.66591 9.91505V8.16534" id="Vector_4" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[33.248px] left-0 rounded-[21243700px] top-0 w-[140.116px]" data-name="Button">
      <Icon1 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[78.99px] not-italic text-[#4a5565] text-[12px] text-center top-[8.09px] whitespace-nowrap">{` รายงานยอดขาย`}</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[16px] size-[13.998px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_206_9461)" id="Icon">
          <path d={svgPaths.p21910d70} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p1ad28a00} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 10.2067V3.79105" id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_206_9461">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[33.248px] left-[148.11px] rounded-[21243700px] top-0 w-[122.112px]" data-name="Button">
      <Icon2 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[69.99px] not-italic text-[#4a5565] text-[12px] text-center top-[8.09px] whitespace-nowrap">{` ใบเสร็จล่าสุด`}</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[14px] size-[13.998px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute h-[31.992px] left-[278.21px] rounded-[21243700px] shadow-[0px_2px_12px_0px_rgba(232,128,42,0.3)] top-[0.62px] w-[104.454px]" data-name="Button" style={{ backgroundImage: "linear-gradient(162.971deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <Icon3 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[18px] left-[59.99px] not-italic text-[12px] text-center text-white top-[6.73px] whitespace-nowrap">{` เพิ่มสินค้า`}</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[33.248px] left-[723.45px] top-[1.38px] w-[382.667px]" data-name="Container">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Retail1() {
  return (
    <div className="h-[35.998px] relative shrink-0 w-full" data-name="Retail">
      <Heading />
      <Container6 />
    </div>
  );
}

function PosTab() {
  return <div className="absolute left-[101.54px] rounded-[21243700px] size-[111.992px] top-[-31.99px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 111.99 111.99\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -7.919 -7.919 0 55.996 55.996)\\'><stop stop-color=\\'rgba(255,255,255,0.15)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(128,128,128,0.075)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function PosTab1() {
  return <div className="absolute left-[-48px] rounded-[21243700px] size-[127.998px] top-[50.48px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 128 128\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -9.0508 -9.0508 0 63.999 63.999)\\'><stop stop-color=\\'rgba(255,255,255,0.07)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[19.993px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9925 19.9925">
        <g clipPath="url(#clip0_206_9458)" id="Icon">
          <path d={svgPaths.p1276f080} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_206_9458">
            <rect fill="white" height="19.9925" width="19.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] relative rounded-[14px] shrink-0 size-[39.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10.001px] relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex h-[39.995px] items-start justify-between left-0 pr-[109.548px] top-0 w-[149.543px]" data-name="Container">
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[51.99px] w-[149.543px]" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-[rgba(255,255,255,0.6)] top-[0.37px] tracking-[0.22px] whitespace-nowrap">ยอดขายวันนี้</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[25.997px] relative shrink-0 w-[87.736px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[26px] left-0 not-italic text-[26px] text-white top-[-0.86px] whitespace-nowrap">฿4,280</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex h-[25.997px] items-end left-0 top-[72.49px] w-[149.543px]" data-name="Container">
      <Text4 />
    </div>
  );
}

function PosTab2() {
  return (
    <div className="absolute h-[98.489px] left-[16px] top-[16px] w-[149.543px]" data-name="POSTab">
      <Container9 />
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container8() {
  return (
    <div className="flex-[1_0_0] h-[130.481px] min-h-px min-w-px overflow-clip relative rounded-[16px] shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]" data-name="Container" style={{ backgroundImage: "linear-gradient(153.745deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <PosTab />
      <PosTab1 />
      <PosTab2 />
    </div>
  );
}

function PosTab3() {
  return <div className="absolute left-[101.54px] rounded-[21243700px] size-[111.992px] top-[-31.99px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 111.99 111.99\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -7.919 -7.919 0 55.996 55.996)\\'><stop stop-color=\\'rgba(255,255,255,0.15)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(128,128,128,0.075)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function PosTab4() {
  return <div className="absolute left-[-48px] rounded-[21243700px] size-[127.998px] top-[50.48px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 128 128\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -9.0508 -9.0508 0 63.999 63.999)\\'><stop stop-color=\\'rgba(255,255,255,0.07)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[19.993px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9925 19.9925">
        <g clipPath="url(#clip0_206_9455)" id="Icon">
          <path d={svgPaths.p4078480} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_206_9455">
            <rect fill="white" height="19.9925" width="19.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] relative rounded-[14px] shrink-0 size-[39.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10.001px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex h-[39.995px] items-start justify-between left-0 pr-[109.548px] top-0 w-[149.543px]" data-name="Container">
      <Container15 />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[51.99px] w-[149.543px]" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-[rgba(255,255,255,0.6)] top-[0.37px] tracking-[0.22px] whitespace-nowrap">รายการวันนี้</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[25.997px] relative shrink-0 w-[31.201px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[26px] left-0 not-italic text-[26px] text-white top-[-0.86px] whitespace-nowrap">14</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex h-[25.997px] items-end left-0 top-[72.49px] w-[149.543px]" data-name="Container">
      <Text5 />
    </div>
  );
}

function PosTab5() {
  return (
    <div className="absolute h-[98.489px] left-[16px] top-[16px] w-[149.543px]" data-name="POSTab">
      <Container14 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container13() {
  return (
    <div className="flex-[1_0_0] h-[130.481px] min-h-px min-w-px overflow-clip relative rounded-[16px] shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]" data-name="Container" style={{ backgroundImage: "linear-gradient(153.745deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <PosTab3 />
      <PosTab4 />
      <PosTab5 />
    </div>
  );
}

function PosTab6() {
  return <div className="absolute left-[101.54px] rounded-[21243700px] size-[111.992px] top-[-31.99px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 111.99 111.99\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -7.919 -7.919 0 55.996 55.996)\\'><stop stop-color=\\'rgba(255,255,255,0.15)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(128,128,128,0.075)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function PosTab7() {
  return <div className="absolute left-[-48px] rounded-[21243700px] size-[127.998px] top-[50.48px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 128 128\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -9.0508 -9.0508 0 63.999 63.999)\\'><stop stop-color=\\'rgba(255,255,255,0.07)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[19.993px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9925 19.9925">
        <g clipPath="url(#clip0_206_9448)" id="Icon">
          <path d={svgPaths.p344da300} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_206_9448">
            <rect fill="white" height="19.9925" width="19.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] relative rounded-[14px] shrink-0 size-[39.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10.001px] relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex h-[39.995px] items-start justify-between left-0 pr-[109.548px] top-0 w-[149.543px]" data-name="Container">
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[51.99px] w-[149.543px]" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-[rgba(255,255,255,0.6)] top-[0.37px] tracking-[0.22px] whitespace-nowrap">สินค้าใกล้หมด</p>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[25.997px] relative shrink-0 w-[31.201px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[26px] left-0 not-italic text-[26px] text-white top-[-0.86px] whitespace-nowrap">38</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex h-[25.997px] items-end left-0 top-[72.49px] w-[149.543px]" data-name="Container">
      <Text6 />
    </div>
  );
}

function PosTab8() {
  return (
    <div className="absolute h-[98.489px] left-[16px] top-[16px] w-[149.543px]" data-name="POSTab">
      <Container19 />
      <Container21 />
      <Container22 />
    </div>
  );
}

function Container18() {
  return (
    <div className="flex-[1_0_0] h-[130.481px] min-h-px min-w-px overflow-clip relative rounded-[16px] shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]" data-name="Container" style={{ backgroundImage: "linear-gradient(153.745deg, rgb(92, 107, 192) 0%, rgb(63, 81, 181) 100%)" }}>
      <PosTab6 />
      <PosTab7 />
      <PosTab8 />
    </div>
  );
}

function PosTab9() {
  return <div className="absolute left-[101.55px] rounded-[21243700px] size-[111.992px] top-[-31.99px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 111.99 111.99\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -7.919 -7.919 0 55.996 55.996)\\'><stop stop-color=\\'rgba(255,255,255,0.15)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(128,128,128,0.075)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function PosTab10() {
  return <div className="absolute left-[-48px] rounded-[21243700px] size-[127.998px] top-[50.48px]" data-name="POSTab" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 128 128\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -9.0508 -9.0508 0 63.999 63.999)\\'><stop stop-color=\\'rgba(255,255,255,0.07)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[19.993px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9925 19.9925">
        <g clipPath="url(#clip0_206_9433)" id="Icon">
          <path d={svgPaths.pc3aa880} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_206_9433">
            <rect fill="white" height="19.9925" width="19.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] relative rounded-[14px] shrink-0 size-[39.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10.001px] relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute content-stretch flex h-[39.995px] items-start justify-between left-0 pr-[109.558px] top-0 w-[149.553px]" data-name="Container">
      <Container25 />
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[51.99px] w-[149.553px]" data-name="Container">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-[rgba(255,255,255,0.6)] top-[0.37px] tracking-[0.22px] whitespace-nowrap">Stock ใกล้หมด</p>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[25.997px] relative shrink-0 w-[15.6px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[26px] left-0 not-italic text-[26px] text-white top-[-0.86px] whitespace-nowrap">3</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex h-[25.997px] items-end left-0 top-[72.49px] w-[149.553px]" data-name="Container">
      <Text7 />
    </div>
  );
}

function PosTab11() {
  return (
    <div className="absolute h-[98.489px] left-[16px] top-[16px] w-[149.553px]" data-name="POSTab">
      <Container24 />
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container23() {
  return (
    <div className="flex-[1_0_0] h-[130.481px] min-h-px min-w-px overflow-clip relative rounded-[16px] shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]" data-name="Container" style={{ backgroundImage: "linear-gradient(153.745deg, rgb(229, 57, 53) 0%, rgb(198, 40, 40) 100%)" }}>
      <PosTab9 />
      <PosTab10 />
      <PosTab11 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Container13 />
      <Container18 />
      <Container23 />
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 w-[1154.115px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[16px] pt-[19.993px] px-[23.999px] relative w-full">
        <Retail1 />
        <Container7 />
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[#e8802a] h-[29.252px] left-0 rounded-[21243700px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)] top-0 w-[69.712px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[35px] not-italic text-[12px] text-center text-white top-[6.73px] whitespace-nowrap">ทั้งหมด</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[29.252px] left-[75.71px] rounded-[21243700px] top-0 w-[64.122px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[31.5px] not-italic text-[#6a7282] text-[12px] text-center top-[6.1px] whitespace-nowrap">อาหาร</p>
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[29.252px] left-[145.82px] rounded-[21243700px] top-0 w-[82.008px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[40.5px] not-italic text-[#6a7282] text-[12px] text-center top-[6.1px] whitespace-nowrap">Grooming</p>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[29.252px] left-[233.83px] rounded-[21243700px] top-0 w-[70.79px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[35px] not-italic text-[#6a7282] text-[12px] text-center top-[6.1px] whitespace-nowrap">ของเล่น</p>
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[29.252px] left-[310.61px] rounded-[21243700px] top-0 w-[84.204px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[41.5px] not-italic text-[#6a7282] text-[12px] text-center top-[6.1px] whitespace-nowrap">ยา/วิตามิน</p>
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[29.252px] left-[400.81px] rounded-[21243700px] top-0 w-[52.806px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[26px] not-italic text-[#6a7282] text-[12px] text-center top-[6.1px] whitespace-nowrap">อื่นๆ</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[29.252px] left-[235.99px] top-[4px] w-[453.615px]" data-name="Container">
      <Button4 />
      <Button5 />
      <Button6 />
      <Button7 />
      <Button8 />
      <Button9 />
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-white h-[37.245px] left-0 rounded-[21243700px] top-0 w-[223.993px]" data-name="Text Input">
      <div className="content-stretch flex items-center overflow-clip pl-[36px] pr-[12px] py-[8px] relative rounded-[inherit] size-full">
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-[rgba(10,10,10,0.5)] whitespace-nowrap">ค้นหาสินค้า, บาร์โค้ด...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[12px] size-[15.996px] top-[10.62px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Icon">
          <path d={svgPaths.p1ac02680} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p18cccdc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[37.245px] left-0 top-0 w-[223.993px]" data-name="Container">
      <TextInput />
      <Icon8 />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[37.245px] relative shrink-0 w-full" data-name="Container">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Text8() {
  return (
    <div className="absolute bg-[rgba(232,128,42,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[45.604px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#e8802a] text-[10px] top-[1.73px] whitespace-nowrap">อาหาร</p>
    </div>
  );
}

function Container35() {
  return <div className="absolute left-[107.26px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(232,128,42,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(174,96,32,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(116,64,21,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(58,32,11,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container36() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(232,128,42,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(174,96,32,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(116,64,21,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(58,32,11,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ImageMilkBone() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (ขนม Milk-Bone)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageMilkBone} />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(232,128,42,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <ImageMilkBone />
    </div>
  );
}

function PosTab13() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.418deg, rgb(255, 243, 230) 0%, rgb(254, 251, 248) 50%, rgb(255, 243, 230) 100%)" }}>
      <Text8 />
      <Container35 />
      <Container36 />
      <Container37 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[79.79px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">ขนม Milk-Bone</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[79.99px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: TRT-001</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[79.91px] not-italic text-[#e8802a] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿49</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/ชิ้น</span>
      </p>
    </div>
  );
}

function Text9() {
  return (
    <div className="bg-[#fef2f2] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[60.106px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[30.49px] not-italic text-[#fb2c36] text-[10px] text-center top-[1.73px] whitespace-nowrap">คงเหลือ 4</p>
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.267px]" data-name="Container">
      <Text9 />
      <Button10 />
    </div>
  );
}

function PosTab14() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph />
      <Paragraph1 />
      <Paragraph2 />
      <Container38 />
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute bg-white h-[230.225px] left-0 rounded-[16px] top-0 w-[184.533px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab13 />
        <PosTab14 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text10() {
  return (
    <div className="absolute bg-[rgba(232,128,42,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[45.604px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#e8802a] text-[10px] top-[1.73px] whitespace-nowrap">อาหาร</p>
    </div>
  );
}

function Container40() {
  return <div className="absolute left-[107.26px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(232,128,42,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(174,96,32,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(116,64,21,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(58,32,11,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container41() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(232,128,42,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(174,96,32,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(116,64,21,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(58,32,11,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ImageRoyalCaninAdult3Kg() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (Royal Canin Adult 3kg)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageMilkBone} />
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(232,128,42,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <ImageRoyalCaninAdult3Kg />
    </div>
  );
}

function PosTab15() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.418deg, rgb(255, 243, 230) 0%, rgb(254, 251, 248) 50%, rgb(255, 243, 230) 100%)" }}>
      <Text10 />
      <Container40 />
      <Container41 />
      <Container42 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[79.79px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">Royal Canin Adult 3kg</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[79.82px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: FOOD-012</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[79.72px] not-italic text-[#e8802a] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿890</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/ถุง</span>
      </p>
    </div>
  );
}

function Text11() {
  return (
    <div className="bg-[#f3f4f6] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[66.101px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[33.49px] not-italic text-[#6a7282] text-[10px] text-center top-[1.73px] whitespace-nowrap">คงเหลือ 18</p>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon10 />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.267px]" data-name="Container">
      <Text11 />
      <Button11 />
    </div>
  );
}

function PosTab16() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph3 />
      <Paragraph4 />
      <Paragraph5 />
      <Container43 />
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute bg-white h-[230.225px] left-[196.53px] rounded-[16px] top-0 w-[184.533px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab15 />
        <PosTab16 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text12() {
  return (
    <div className="absolute bg-[rgba(214,96,143,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[61.204px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#d6608f] text-[10px] top-[1.73px] whitespace-nowrap">Grooming</p>
    </div>
  );
}

function Container45() {
  return <div className="absolute left-[107.26px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(214,96,143,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(161,72,107,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(107,48,72,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(54,24,36,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container46() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(214,96,143,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(161,72,107,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(107,48,72,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(54,24,36,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ImageFurminator() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (แชมพูสุนัข Furminator)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageFurminator} />
    </div>
  );
}

function Container47() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(214,96,143,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <ImageFurminator />
    </div>
  );
}

function PosTab17() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.418deg, rgb(252, 228, 236) 0%, rgb(254, 251, 248) 50%, rgb(252, 228, 236) 100%)" }}>
      <Text12 />
      <Container45 />
      <Container46 />
      <Container47 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[79.72px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">แชมพูสุนัข Furminator</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[79.8px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: GRM-005</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[80.07px] not-italic text-[#d6608f] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿350</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/ขวด</span>
      </p>
    </div>
  );
}

function Text13() {
  return (
    <div className="bg-[#f3f4f6] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[60.106px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[30.49px] not-italic text-[#6a7282] text-[10px] text-center top-[1.73px] whitespace-nowrap">คงเหลือ 9</p>
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon11 />
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.267px]" data-name="Container">
      <Text13 />
      <Button12 />
    </div>
  );
}

function PosTab18() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph6 />
      <Paragraph7 />
      <Paragraph8 />
      <Container48 />
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute bg-white h-[230.225px] left-[393.06px] rounded-[16px] top-0 w-[184.533px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab17 />
        <PosTab18 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text14() {
  return (
    <div className="absolute bg-[rgba(67,160,71,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[63.628px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#43a047] text-[10px] top-[1.73px] whitespace-nowrap">ยา/วิตามิน</p>
    </div>
  );
}

function Container50() {
  return <div className="absolute left-[107.27px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(67,160,71,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(50,120,53,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(34,80,36,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(17,40,18,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container51() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(67,160,71,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(50,120,53,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(34,80,36,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(17,40,18,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ImageC() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (วิตามิน C 60 เม็ด)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageC60} />
    </div>
  );
}

function Container52() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(67,160,71,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <ImageC />
    </div>
  );
}

function PosTab19() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.419deg, rgb(232, 245, 233) 0%, rgb(254, 251, 248) 50%, rgb(232, 245, 233) 100%)" }}>
      <Text14 />
      <Container50 />
      <Container51 />
      <Container52 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.277px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[79.71px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">วิตามิน C 60 เม็ด</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.277px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[79.92px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: VIT-008</p>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.277px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[80.01px] not-italic text-[#43a047] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿180</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/กระปุก</span>
      </p>
    </div>
  );
}

function Text15() {
  return (
    <div className="bg-[#f3f4f6] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[66.101px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[33.49px] not-italic text-[#6a7282] text-[10px] text-center top-[1.73px] whitespace-nowrap">คงเหลือ 22</p>
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon12 />
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.277px]" data-name="Container">
      <Text15 />
      <Button13 />
    </div>
  );
}

function PosTab20() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph9 />
      <Paragraph10 />
      <Paragraph11 />
      <Container53 />
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute bg-white h-[230.225px] left-[589.6px] rounded-[16px] top-0 w-[184.542px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab19 />
        <PosTab20 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text16() {
  return (
    <div className="absolute bg-[rgba(92,107,192,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[51.638px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#5c6bc0] text-[10px] top-[1.73px] whitespace-nowrap">ของเล่น</p>
    </div>
  );
}

function Container55() {
  return <div className="absolute left-[107.26px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(92,107,192,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(69,80,144,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(46,54,96,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(23,27,48,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container56() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(92,107,192,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(69,80,144,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(46,54,96,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(23,27,48,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ImageS() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (ลูกบอลยาง S)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageS} />
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(92,107,192,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <ImageS />
    </div>
  );
}

function PosTab21() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.418deg, rgb(232, 234, 246) 0%, rgb(254, 251, 248) 50%, rgb(232, 234, 246) 100%)" }}>
      <Text16 />
      <Container55 />
      <Container56 />
      <Container57 />
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[80.07px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">ลูกบอลยาง S</p>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[79.67px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: TOY-002</p>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[79.66px] not-italic text-[#5c6bc0] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿89</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/ลูก</span>
      </p>
    </div>
  );
}

function Text17() {
  return (
    <div className="bg-[#f3f4f6] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[66.101px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[33.49px] not-italic text-[#6a7282] text-[10px] text-center top-[1.73px] whitespace-nowrap">คงเหลือ 15</p>
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button14() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon13 />
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.267px]" data-name="Container">
      <Text17 />
      <Button14 />
    </div>
  );
}

function PosTab22() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph12 />
      <Paragraph13 />
      <Paragraph14 />
      <Container58 />
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute bg-white h-[230.225px] left-0 rounded-[16px] top-[242.22px] w-[184.533px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab21 />
        <PosTab22 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text18() {
  return (
    <div className="absolute bg-[rgba(120,144,156,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[35.909px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#78909c] text-[10px] top-[1.73px] whitespace-nowrap">อื่นๆ</p>
    </div>
  );
}

function Container60() {
  return <div className="absolute left-[107.26px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(120,144,156,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(90,108,117,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(60,72,78,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(30,36,39,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container61() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(120,144,156,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(90,108,117,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(60,72,78,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(30,36,39,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ImageLeatherPremium() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (สายจูง Leather Premium)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageLeatherPremium} />
    </div>
  );
}

function Container62() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(120,144,156,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <ImageLeatherPremium />
    </div>
  );
}

function PosTab23() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.418deg, rgb(236, 239, 241) 0%, rgb(254, 251, 248) 50%, rgb(236, 239, 241) 100%)" }}>
      <Text18 />
      <Container60 />
      <Container61 />
      <Container62 />
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[80px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">สายจูง Leather Premium</p>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[79.86px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: ACC-013</p>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[79.7px] not-italic text-[#78909c] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿450</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/เส้น</span>
      </p>
    </div>
  );
}

function Text19() {
  return (
    <div className="bg-[#f3f4f6] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[60.106px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[30.49px] not-italic text-[#6a7282] text-[10px] text-center top-[1.73px] whitespace-nowrap">คงเหลือ 7</p>
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon14 />
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.267px]" data-name="Container">
      <Text19 />
      <Button15 />
    </div>
  );
}

function PosTab24() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph15 />
      <Paragraph16 />
      <Paragraph17 />
      <Container63 />
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute bg-white h-[230.225px] left-[196.53px] rounded-[16px] top-[242.22px] w-[184.533px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab23 />
        <PosTab24 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text20() {
  return (
    <div className="absolute bg-[rgba(214,96,143,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[61.204px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#d6608f] text-[10px] top-[1.73px] whitespace-nowrap">Grooming</p>
    </div>
  );
}

function Text21() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.06)] h-[17.5px] left-[110.86px] rounded-[21243700px] top-[7.99px] w-[60.403px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[13.5px] left-[7.99px] not-italic text-[#6a7282] text-[9px] top-[1.73px] whitespace-nowrap">ไม่ใช้ Stock</p>
    </div>
  );
}

function Container65() {
  return <div className="absolute left-[107.26px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(214,96,143,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(161,72,107,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(107,48,72,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(54,24,36,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container66() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(214,96,143,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(161,72,107,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(107,48,72,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(54,24,36,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function ImageCustom() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (ตัดขนพิเศษ (Custom))">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageCustom} />
    </div>
  );
}

function Container67() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(214,96,143,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <ImageCustom />
    </div>
  );
}

function PosTab25() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.418deg, rgb(252, 228, 236) 0%, rgb(254, 251, 248) 50%, rgb(252, 228, 236) 100%)" }}>
      <Text20 />
      <Text21 />
      <Container65 />
      <Container66 />
      <Container67 />
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[80.08px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">ตัดขนพิเศษ (Custom)</p>
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[79.64px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: SVC-081</p>
    </div>
  );
}

function Paragraph20() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.267px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[79.88px] not-italic text-[#d6608f] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿500</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/ครั้ง</span>
      </p>
    </div>
  );
}

function Text22() {
  return (
    <div className="bg-[#f3f4f6] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[51.866px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[25.99px] not-italic text-[#99a1af] text-[10px] text-center top-[1.73px] whitespace-nowrap">ไม่จำกัด</p>
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon15 />
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.267px]" data-name="Container">
      <Text22 />
      <Button16 />
    </div>
  );
}

function PosTab26() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph18 />
      <Paragraph19 />
      <Paragraph20 />
      <Container68 />
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute bg-white h-[230.225px] left-[393.06px] rounded-[16px] top-[242.22px] w-[184.533px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab25 />
        <PosTab26 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text23() {
  return (
    <div className="absolute bg-[rgba(120,144,156,0.09)] h-[18.993px] left-[12px] rounded-[21243700px] top-[7.99px] w-[35.909px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[7.99px] not-italic text-[#78909c] text-[10px] top-[1.73px] whitespace-nowrap">อื่นๆ</p>
    </div>
  );
}

function Text24() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.06)] h-[17.5px] left-[110.87px] rounded-[21243700px] top-[7.99px] w-[60.403px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[13.5px] left-[7.99px] not-italic text-[#6a7282] text-[9px] top-[1.73px] whitespace-nowrap">ไม่ใช้ Stock</p>
    </div>
  );
}

function Container70() {
  return <div className="absolute left-[107.27px] opacity-10 rounded-[21243700px] size-[95.996px] top-[-19.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 95.996 95.996\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -6.7879 -6.7879 0 47.998 47.998)\\'><stop stop-color=\\'rgba(120,144,156,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(90,108,117,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(60,72,78,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(30,36,39,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Container71() {
  return <div className="absolute left-[-31.99px] opacity-5 rounded-[21243700px] size-[80px] top-[31.99px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -5.6568 -5.6568 0 40 40)\\'><stop stop-color=\\'rgba(120,144,156,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(90,108,117,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(60,72,78,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(30,36,39,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Image() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (บริการรับ-ส่งถึงบ้าน)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImage} />
    </div>
  );
}

function Container72() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[63.64px] pt-[3.997px] px-[3.997px] rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(120,144,156,0.13)] size-[55.991px] top-[52px]" data-name="Container">
      <Image />
    </div>
  );
}

function PosTab27() {
  return (
    <div className="h-[80px] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="POSTab" style={{ backgroundImage: "linear-gradient(156.419deg, rgb(236, 239, 241) 0%, rgb(254, 251, 248) 50%, rgb(236, 239, 241) 100%)" }}>
      <Text23 />
      <Text24 />
      <Container70 />
      <Container71 />
      <Container72 />
    </div>
  );
}

function Paragraph21() {
  return (
    <div className="absolute h-[15.996px] left-[12px] overflow-clip top-[36px] w-[159.277px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] left-[79.67px] not-italic text-[#1e2939] text-[12px] text-center top-[0.1px] whitespace-nowrap">บริการรับ-ส่งถึงบ้าน</p>
    </div>
  );
}

function Paragraph22() {
  return (
    <div className="absolute h-[14.997px] left-[12px] top-[53.99px] w-[159.277px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-[80.04px] not-italic text-[#99a1af] text-[10px] text-center top-[-0.27px] whitespace-nowrap">SKU: SVC-T81</p>
    </div>
  );
}

function Paragraph23() {
  return (
    <div className="absolute h-[23.989px] left-[12px] top-[76.98px] w-[159.277px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[0] left-[79.9px] not-italic text-[#78909c] text-[0px] text-center top-[-0.27px] whitespace-nowrap">
        <span className="leading-[24px] text-[16px]">฿200</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] text-[#99a1af] text-[12px]">/เที่ยว</span>
      </p>
    </div>
  );
}

function Text25() {
  return (
    <div className="bg-[#f3f4f6] h-[18.993px] relative rounded-[21243700px] shrink-0 w-[51.866px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] left-[25.99px] not-italic text-[#99a1af] text-[10px] text-center top-[1.73px] whitespace-nowrap">ไม่จำกัด</p>
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button17() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_8px_0px_rgba(67,160,71,0.35)] shrink-0 size-[27.995px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(67, 160, 71) 0%, rgb(46, 125, 50) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon16 />
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute content-stretch flex h-[27.995px] items-center justify-between left-[12px] top-[108.96px] w-[159.277px]" data-name="Container">
      <Text25 />
      <Button17 />
    </div>
  );
}

function PosTab28() {
  return (
    <div className="h-[148.96px] relative shrink-0 w-full" data-name="POSTab">
      <Paragraph21 />
      <Paragraph22 />
      <Paragraph23 />
      <Container73 />
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute bg-white h-[230.225px] left-[589.6px] rounded-[16px] top-[242.22px] w-[184.542px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.633px] relative rounded-[inherit] size-full">
        <PosTab27 />
        <PosTab28 />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[472.45px] relative shrink-0 w-full" data-name="Container">
      <Container34 />
      <Container39 />
      <Container44 />
      <Container49 />
      <Container54 />
      <Container59 />
      <Container64 />
      <Container69 />
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[712.153px] relative shrink-0 w-[814.123px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[15.996px] items-start pt-[19.993px] px-[19.993px] relative size-full">
        <Container30 />
        <Container33 />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="flex-[1_0_0] h-[788.136px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container29 />
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_200_2758)" id="Icon">
          <path d={svgPaths.p113eae00} id="Vector" stroke="var(--stroke-0, #E8802A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p13511f80} id="Vector_2" stroke="var(--stroke-0, #E8802A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p20536d00} id="Vector_3" stroke="var(--stroke-0, #E8802A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_200_2758">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text26() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[79.93px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">ตะกร้าสินค้า</p>
      </div>
    </div>
  );
}

function Container76() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[103.919px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.993px] items-center relative size-full">
        <Icon17 />
        <Text26 />
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[44.625px] relative shrink-0 w-[339.358px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[0.633px] pl-[15.996px] pr-[219.443px] relative size-full">
        <Container76 />
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute content-stretch flex h-[16.461px] items-start left-[16px] top-[17.06px] w-[91.96px]" data-name="Label">
      <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] whitespace-nowrap">เลือกรายขาย / ลูกค้า</p>
    </div>
  );
}

function Option() {
  return <div className="absolute left-[-1071.38px] size-0 top-[-209.86px]" data-name="Option" />;
}

function Option1() {
  return <div className="absolute left-[-1071.38px] size-0 top-[-209.86px]" data-name="Option" />;
}

function Option2() {
  return <div className="absolute left-[-1071.38px] size-0 top-[-209.86px]" data-name="Option" />;
}

function Dropdown() {
  return (
    <div className="absolute bg-[#f9fafb] border-[#e5e7eb] border-[0.633px] border-solid h-[33.248px] left-0 rounded-[14px] top-0 w-[307.366px]" data-name="Dropdown">
      <Option />
      <Option1 />
      <Option2 />
    </div>
  );
}

function Icon18() {
  return (
    <div className="absolute left-[283.38px] size-[13.998px] top-[9.62px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d={svgPaths.p48e0200} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Container78() {
  return (
    <div className="absolute h-[33.248px] left-[16px] top-[35.99px] w-[307.366px]" data-name="Container">
      <Dropdown />
      <Icon18 />
    </div>
  );
}

function Container77() {
  return (
    <div className="h-[81.869px] relative shrink-0 w-[339.358px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Label />
        <Container78 />
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="absolute left-[149.68px] size-[39.995px] top-[63.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.9949 39.9949">
        <g id="Icon" opacity="0.4">
          <path d={svgPaths.p1c413000} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33291" />
          <path d={svgPaths.p31e25d00} id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33291" />
          <path d={svgPaths.p2bf42c00} id="Vector_3" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33291" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph24() {
  return (
    <div className="absolute h-[15.996px] left-[113.51px] top-[111.98px] w-[112.348px]" data-name="Paragraph">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#d1d5dc] text-[12px] top-[0.1px] whitespace-nowrap">ยังไม่มีสินค้าในตะกร้า</p>
    </div>
  );
}

function Paragraph25() {
  return (
    <div className="absolute h-[14.997px] left-[111.98px] top-[129.98px] w-[115.395px]" data-name="Paragraph">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#d1d5dc] text-[10px] top-[-0.27px] whitespace-nowrap">คลิกสินค้า เพื่อเพิ่มรายการ</p>
    </div>
  );
}

function Container80() {
  return (
    <div className="h-[208.967px] relative shrink-0 w-full" data-name="Container">
      <Icon19 />
      <Paragraph24 />
      <Paragraph25 />
    </div>
  );
}

function Container79() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[339.358px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container80 />
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="bg-white h-[788.136px] relative shrink-0 w-[339.991px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-l-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[0.633px] relative size-full">
        <Container75 />
        <Container77 />
        <Container79 />
      </div>
    </div>
  );
}

function PosTab12() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[1154.115px]" data-name="POSTab">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <Container28 />
        <Container74 />
      </div>
    </div>
  );
}

function Retail() {
  return (
    <div className="bg-[#fefbf8] h-[860.756px] relative shrink-0 w-[1154.115px]" data-name="Retail">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container5 />
        <PosTab12 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Container">
      <Header />
      <Retail />
    </div>
  );
}