function Icon() {
  return (
    <div className="absolute left-[16px] size-[13.998px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

export default function Button() {
  return (
    <div className="relative rounded-[21243700px] shadow-[0px_2px_12px_0px_rgba(232,128,42,0.3)] size-full" data-name="Button" style={{ backgroundImage: "linear-gradient(162.976deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <Icon />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[61.99px] not-italic text-[12px] text-center text-white top-[8.09px] whitespace-nowrap">{` เพิ่มสินค้า`}</p>
    </div>
  );
}