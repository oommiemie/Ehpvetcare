import svgPaths from "./svg-hzv7bc3cys";

function Icon() {
  return (
    <div className="relative shrink-0 size-[19.993px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9925 19.9925">
        <g clipPath="url(#clip0_164_5598)" id="Icon">
          <path d={svgPaths.pb16fe00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          <path d="M9.99625 7.49719V10.8293" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          <path d="M9.99625 14.1614H10.0046" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
        </g>
        <defs>
          <clipPath id="clip0_164_5598">
            <rect fill="white" height="19.9925" width="19.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[14px] shrink-0 size-[39.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(156, 163, 175) 0%, rgb(107, 114, 128) 100%)" }}>
      <Icon />
    </div>
  );
}

function Text1() {
  return <div className="absolute bg-[#9ca3af] left-[9.99px] rounded-[21243700px] size-[5.995px] top-[8.5px]" data-name="Text" />;
}

function Text() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] h-[22.99px] relative rounded-[21243700px] shrink-0 w-[73.293px]" data-name="Text">
      <Text1 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[41.98px] not-italic text-[#6b7280] text-[10px] text-center top-[3.73px] whitespace-nowrap">ซ่อมบำรุง</p>
    </div>
  );
}

function RoomsTab() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="RoomsTab" style={{ backgroundImage: "linear-gradient(148.782deg, rgb(230, 230, 230) 6.1733%, rgb(245, 245, 245) 93.827%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-center px-[14px] py-[12px] relative w-full">
          <Container1 />
          <p className="font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-black text-center tracking-[0.28px] whitespace-nowrap">A-01</p>
          <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] text-center whitespace-nowrap">กรงมาตรฐาน</p>
          <Text />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[60px] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] relative size-full">
          <p className="flex-[1_0_0] font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[#99a1af] text-[10px]">กำลังซ่อมบำรุงห้องพักสัตว์เลี่ยง</p>
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white relative rounded-[16px] size-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[4px] relative rounded-[inherit] size-full">
        <RoomsTab />
        <Frame />
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[1.266px] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}