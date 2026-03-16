import svgPaths from "./svg-lxtubw66mu";

function Crown() {
  return (
    <div className="h-[20.342px] relative shrink-0 w-[25.41px]" data-name="crown 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.4102 20.3418">
          <g id="Group">
            <path d={svgPaths.p255a1500} fill="var(--fill-0, white)" id="Vector" opacity="0" />
            <path d={svgPaths.p3b862af0} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[14px] shrink-0 size-[39.995px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgb(25, 165, 137) 0%, rgb(13, 124, 102) 100%)" }}>
      <Crown />
    </div>
  );
}

function Text1() {
  return <div className="absolute bg-[#34d399] left-[9.99px] rounded-[21243700px] shadow-[0px_0px_4px_0px_rgba(52,211,153,0.6)] size-[5.995px] top-[8.5px]" data-name="Text" />;
}

function Text() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] h-[22.99px] relative rounded-[21243700px] shrink-0 w-[45.98px]" data-name="Text">
      <Text1 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[15px] left-[28.48px] not-italic text-[#059669] text-[10px] text-center top-[3.73px] whitespace-nowrap">ว่าง</p>
    </div>
  );
}

function RoomsTab() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="RoomsTab" style={{ backgroundImage: "linear-gradient(139.123deg, rgba(172, 255, 238, 0.2) 0%, rgba(220, 255, 248, 0.2) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-center px-[14px] py-[12px] relative w-full">
          <Container1 />
          <p className="font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-black text-center tracking-[0.28px] whitespace-nowrap">A-01</p>
          <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#99a1af] text-[10px] text-center whitespace-nowrap">{` ห้อง VIP`}</p>
          <Text />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[60px] relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <p className="flex-[1_0_0] font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[#99a1af] text-[10px]">ยังไม่มีสัตว์เข้ารับฝากเลี้ยง</p>
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