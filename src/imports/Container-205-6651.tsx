import svgPaths from "./svg-582l6msalp";

function Container1() {
  return <div className="bg-[#19a589] h-[31.992px] rounded-[21243700px] shrink-0 w-[3.997px]" data-name="Container" />;
}

function Icon() {
  return (
    <div className="h-[15.996px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.39%]" data-name="Vector">
        <div className="absolute inset-[-5.01%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6435 14.6435">
            <path d={svgPaths.p1f806300} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[35.42%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.99849 5.99849">
            <path d={svgPaths.p1e9a1700} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[15.996px] top-[2px]" data-name="Text">
      <Icon />
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[19.993px] left-[23.99px] top-0 w-[65.31px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">รายการยา</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[15.996px] left-[97.29px] top-[2px] w-[72.333px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">Drug Registry</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] h-[19.993px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text />
        <Text1 />
        <Text2 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[12px] size-[13.998px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[31.992px] relative rounded-[21243700px] shadow-[0px_2px_10px_0px_rgba(25,165,137,0.3)] shrink-0 w-[83.363px]" data-name="Button" style={{ backgroundImage: "linear-gradient(159.005deg, rgb(25, 165, 137) 0%, rgb(13, 124, 102) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[18px] left-[50.49px] not-italic text-[12px] text-center text-white top-[6.73px] whitespace-nowrap">{` เพิ่มยา`}</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(249,250,251,0.6)] content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[23.999px] relative size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <Container1 />
      <Container2 />
      <Button />
    </div>
  );
}