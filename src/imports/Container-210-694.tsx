import svgPaths from "./svg-l7m720hkbt";

function Icon() {
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

function Button() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[33.248px] left-0 rounded-[21243700px] top-0 w-[140.116px]" data-name="Button">
      <Icon />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[78.99px] not-italic text-[#4a5565] text-[12px] text-center top-[8.09px] whitespace-nowrap">{` รายงานยอดขาย`}</p>
    </div>
  );
}

function Icon1() {
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

function Button1() {
  return (
    <div className="absolute bg-white border-[#e5e7eb] border-[0.633px] border-solid h-[33.248px] left-[148.11px] rounded-[21243700px] top-0 w-[122.112px]" data-name="Button">
      <Icon1 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[69.99px] not-italic text-[#4a5565] text-[12px] text-center top-[8.09px] whitespace-nowrap">{` ใบเสร็จล่าสุด`}</p>
    </div>
  );
}

function Icon2() {
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

function Button2() {
  return (
    <div className="absolute h-[31.992px] left-[278.21px] rounded-[21243700px] shadow-[0px_2px_12px_0px_rgba(232,128,42,0.3)] top-[0.62px] w-[104.454px]" data-name="Button" style={{ backgroundImage: "linear-gradient(162.971deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <Icon2 />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[18px] left-[59.99px] not-italic text-[12px] text-center text-white top-[6.73px] whitespace-nowrap">{` เพิ่มสินค้า`}</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}