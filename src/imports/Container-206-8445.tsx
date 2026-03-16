import svgPaths from "./svg-1znt8iz7mc";
import imgImageC60 from "figma:asset/5f96fa82449e32b4ba3d7fbeda1750f5d82d5ef7.png";

function ImageC() {
  return (
    <div className="h-[47.998px] relative rounded-[21243700px] shrink-0 w-full" data-name="Image (วิตามิน C 60 เม็ด)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[21243700px] size-full" src={imgImageC60} />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start pt-[3.997px] px-[3.997px] relative rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(67,160,71,0.13)] shrink-0 size-[55.991px]" data-name="Container">
      <ImageC />
    </div>
  );
}

function Text() {
  return (
    <div className="bg-[#f9fafb] h-[20.497px] relative rounded-[8px] shrink-0 w-[42.478px]" data-name="Text">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16.5px] left-[7.99px] not-italic text-[#99a1af] text-[11px] top-[1.9px] whitespace-nowrap">D001</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-[385.197px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative w-full">
        <Text />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#1e2939] text-[14px] whitespace-nowrap">อะม็อกซิซิลลิน 250mg</p>
      </div>
    </div>
  );
}

function StatusBadge() {
  return (
    <div className="bg-[rgba(25,165,137,0.15)] h-[20.497px] relative rounded-[21243700px] shrink-0 w-[65.962px]" data-name="StatusBadge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] left-[7.99px] not-italic text-[#0d7c66] text-[11px] top-[2.37px] whitespace-nowrap">เปิดใช้งาน</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[27.995px] relative shrink-0 w-[59.987px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-start relative size-full">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[27.995px] relative shrink-0 w-[133.943px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.993px] items-center relative size-full">
        <StatusBadge />
        <Container4 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[27.995px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Frame />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#99a1af] text-[11px] top-[0.37px] whitespace-nowrap">Amoxicillin</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-h-px min-w-px relative">
      <Container2 />
      <Paragraph />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full">
      <Container1 />
      <Frame1 />
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute bg-[#eff6ff] h-[20.497px] left-0 rounded-[21243700px] top-0 w-[69.177px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[7.99px] not-italic text-[#155dfc] text-[11px] top-[2.37px] whitespace-nowrap">ยาปฏิชีวนะ</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute bg-[#f9fafb] h-[20.497px] left-[77.17px] rounded-[21243700px] top-0 w-[36.859px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16.5px] left-[7.99px] not-italic text-[#6a7282] text-[11px] top-[2.37px] whitespace-nowrap">แผง</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[38.234px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[0] left-0 not-italic text-[#6a7282] text-[0px] text-[11px] top-[0.37px] whitespace-nowrap">
        <span className="leading-[16.5px]">{`ทุน `}</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] text-[#1e2939]">฿85</span>
      </p>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[48.967px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[0] left-0 not-italic text-[#6a7282] text-[0px] text-[11px] top-[0.37px] whitespace-nowrap">
        <span className="leading-[16.5px]">{`ขาย `}</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16.5px] text-[#19a589]">฿120</span>
      </p>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[98.132px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[0] left-0 not-italic text-[#6a7282] text-[0px] text-[11px] top-[0.37px] whitespace-nowrap">
        <span className="leading-[16.5px]">{`Stock ขั้นต่ำ `}</span>
        <span className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16.5px] text-[#1e2939]">10 แผง</span>
      </p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-center left-[518.28px] top-[2px]">
      <Text3 />
      <Text4 />
      <Text5 />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[20.497px] relative shrink-0 w-full" data-name="Container">
      <Text1 />
      <Text2 />
      <Frame3 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-start p-[16px] relative rounded-[14px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Frame2 />
      <Container5 />
    </div>
  );
}