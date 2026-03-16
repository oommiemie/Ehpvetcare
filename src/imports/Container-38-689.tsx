import svgPaths from "./svg-do0vnct3gv";

function Container1() {
  return <div className="absolute left-[658.95px] opacity-7 rounded-[21243700px] size-[128px] top-[-38.4px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 128 128\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(0 -9.051 -9.051 0 64 64)\\'><stop stop-color=\\'rgba(73,138,79,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(55,104,59,0.75)\\' offset=\\'0.175\\'/><stop stop-color=\\'rgba(37,69,40,0.5)\\' offset=\\'0.35\\'/><stop stop-color=\\'rgba(18,35,20,0.25)\\' offset=\\'0.525\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />;
}

function Calendar() {
  return (
    <div className="relative shrink-0 size-[19.993px]" data-name="Calendar">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9925 19.9925">
        <g clipPath="url(#clip0_38_697)" id="Calendar">
          <path d="M6.66417 1.66604V4.99813" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          <path d="M13.3283 1.66604V4.99813" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          <path d={svgPaths.p3f698300} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          <path d="M2.49906 8.33021H17.4934" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
        </g>
        <defs>
          <clipPath id="clip0_38_697">
            <rect fill="white" height="19.9925" width="19.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative rounded-[14px] shadow-[0px_4px_12px_0px_rgba(73,138,79,0.25)] shrink-0 size-[39.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(73, 138, 79) 0%, rgb(58, 112, 64) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Calendar />
      </div>
    </div>
  );
}

function H() {
  return (
    <div className="h-[30.004px] relative shrink-0 w-full" data-name="h2">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[30px] left-0 not-italic text-[#101828] text-[20px] top-[-0.9px] whitespace-nowrap">รายการนัดหมาย</p>
    </div>
  );
}

function P() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">ทั้งหมด 7 รายการ · กำลังจะถึง 2 รายการ</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[47.998px] relative shrink-0 w-[213.408px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <H />
        <P />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[47.998px] relative shrink-0 w-[265.403px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.999px] items-center relative size-full">
        <Container4 />
        <Container5 />
      </div>
    </div>
  );
}

function Plus() {
  return (
    <div className="absolute left-[16px] size-[15.996px] top-[9.99px]" data-name="Plus">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Plus">
          <path d="M3.3325 7.99799H12.6635" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M7.99799 3.3325V12.6635" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[35.979px] relative rounded-[21243700px] shadow-[0px_4px_14px_0px_rgba(73,138,79,0.3)] shrink-0 w-[124.179px]" data-name="button" style={{ backgroundImage: "linear-gradient(163.842deg, rgb(73, 138, 79) 0%, rgb(58, 112, 64) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Plus />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[20px] left-[73.49px] not-italic text-[14px] text-center text-white top-[8.09px] whitespace-nowrap">เพิ่มนัดใหม่</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex h-[47.998px] items-center justify-between left-[19.99px] top-[19.99px] w-[708.562px]" data-name="Container">
      <Container3 />
      <Button />
    </div>
  );
}

export default function Container() {
  return (
    <div className="border-[0.633px] border-[rgba(73,138,79,0.1)] border-solid overflow-clip relative rounded-[16px] size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(173.212deg, rgb(240, 247, 241) 0%, rgb(254, 251, 248) 60%, rgb(245, 250, 245) 100%)" }}>
      <Container1 />
      <Container2 />
    </div>
  );
}