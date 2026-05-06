interface Props {
  templateId: string;
}

export function TemplatePreview({ templateId }: Props) {
  const previewStyles = {
    classic: (
      <div className="w-full h-full bg-white p-3 text-[4px] leading-tight">
        <div className="text-center border-b border-black pb-1 mb-2">
          <div className="h-2 bg-gray-800 w-3/5 mx-auto mb-1"></div>
          <div className="h-1 bg-gray-600 w-2/5 mx-auto mb-1"></div>
          <div className="flex justify-center gap-1 text-[3px]">
            <div className="h-1 bg-gray-400 w-1/6"></div>
            <div className="h-1 bg-gray-400 w-1/6"></div>
          </div>
        </div>

        <div className="mb-2">
          <div className="h-1.5 bg-gray-800 w-1/3 mb-1"></div>
          <div className="space-y-0.5">
            <div className="h-0.5 bg-gray-300 w-full"></div>
            <div className="h-0.5 bg-gray-300 w-4/5"></div>
          </div>
        </div>

        <div className="mb-2">
          <div className="h-1.5 bg-gray-800 w-1/4 mb-1"></div>
          <div className="space-y-1">
            <div>
              <div className="h-1 bg-gray-600 w-2/5 mb-0.5"></div>
              <div className="h-0.5 bg-gray-400 w-1/3 mb-0.5"></div>
              <div className="h-0.5 bg-gray-300 w-full"></div>
              <div className="h-0.5 bg-gray-300 w-3/4"></div>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <div className="h-1.5 bg-gray-800 w-1/4 mb-1"></div>
          <div className="h-1 bg-gray-600 w-2/5 mb-0.5"></div>
          <div className="h-0.5 bg-gray-400 w-1/3"></div>
        </div>

        <div>
          <div className="h-1.5 bg-gray-800 w-1/5 mb-1"></div>
          <div className="flex gap-0.5 flex-wrap">
            <div className="h-1 bg-gray-300 w-1/6"></div>
            <div className="h-1 bg-gray-300 w-1/5"></div>
            <div className="h-1 bg-gray-300 w-1/6"></div>
          </div>
        </div>
      </div>
    ),

    modern: (
      <div className="w-full h-full bg-white p-3 text-[4px]">
        <div className="mb-2">
          <div className="h-2.5 bg-gray-900 w-3/5 mb-1"></div>
          <div className="h-1 bg-gray-500 w-2/5 mb-1"></div>
          <div className="flex gap-1">
            <div className="h-0.5 bg-gray-400 w-1/6"></div>
            <div className="h-0.5 bg-gray-400 w-1/6"></div>
          </div>
        </div>

        <div className="border-l-2 border-gray-900 pl-1.5 mb-2">
          <div className="h-0.5 bg-gray-300 w-full mb-0.5"></div>
          <div className="h-0.5 bg-gray-300 w-4/5"></div>
        </div>

        <div className="mb-2">
          <div className="h-1 bg-gray-900 w-1/4 mb-1 text-[3px] uppercase"></div>
          <div className="space-y-1.5">
            <div>
              <div className="h-1 bg-gray-700 w-2/5 mb-0.5"></div>
              <div className="h-0.5 bg-gray-500 w-1/3 mb-0.5"></div>
              <div className="h-0.5 bg-gray-400 w-full"></div>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <div className="h-1 bg-gray-900 w-1/4 mb-1"></div>
          <div className="h-1 bg-gray-700 w-2/5 mb-0.5"></div>
          <div className="h-0.5 bg-gray-500 w-1/3"></div>
        </div>

        <div>
          <div className="h-1 bg-gray-900 w-1/5 mb-1"></div>
          <div className="flex gap-0.5 flex-wrap">
            <div className="h-1 bg-gray-200 rounded-sm w-1/6"></div>
            <div className="h-1 bg-gray-200 rounded-sm w-1/5"></div>
            <div className="h-1 bg-gray-200 rounded-sm w-1/6"></div>
          </div>
        </div>
      </div>
    ),

    executive: (
      <div className="w-full h-full bg-white flex">
        <div className="w-2/5 bg-gray-800 p-2 text-[3px]">
          <div className="mb-2">
            <div className="h-1 bg-gray-400 w-1/2 mb-1"></div>
            <div className="space-y-0.5">
              <div className="h-0.5 bg-gray-300 w-full"></div>
              <div className="h-0.5 bg-gray-300 w-3/4"></div>
            </div>
          </div>

          <div className="mb-2">
            <div className="h-1 bg-gray-400 w-1/3 mb-1"></div>
            <div className="space-y-0.5">
              <div className="h-0.5 bg-gray-300 w-4/5"></div>
              <div className="h-0.5 bg-gray-300 w-3/5"></div>
            </div>
          </div>

          <div>
            <div className="h-1 bg-gray-400 w-2/5 mb-1"></div>
            <div className="space-y-0.5">
              <div className="h-0.5 bg-gray-300 w-full"></div>
              <div className="h-0.5 bg-gray-300 w-4/5"></div>
            </div>
          </div>
        </div>

        <div className="w-3/5 p-2 text-[3px]">
          <div className="mb-2">
            <div className="h-2 bg-gray-900 w-3/5 mb-0.5"></div>
            <div className="h-1 bg-gray-600 w-2/5"></div>
          </div>

          <div className="mb-2">
            <div className="h-1 bg-gray-700 w-1/4 mb-1"></div>
            <div className="h-0.5 bg-gray-300 w-full mb-0.5"></div>
            <div className="h-0.5 bg-gray-300 w-4/5"></div>
          </div>

          <div>
            <div className="h-1 bg-gray-700 w-1/3 mb-1"></div>
            <div>
              <div className="h-1 bg-gray-600 w-2/5 mb-0.5"></div>
              <div className="h-0.5 bg-gray-400 w-1/3 mb-0.5"></div>
              <div className="h-0.5 bg-gray-300 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    ),

    structured: (
      <div className="w-full h-full bg-white text-[4px]">
        <div className="bg-blue-900 text-white p-2 mb-2">
          <div className="h-2 bg-blue-200 w-3/5 mb-1"></div>
          <div className="h-1 bg-blue-300 w-2/5 mb-1"></div>
          <div className="grid grid-cols-2 gap-0.5">
            <div className="h-0.5 bg-blue-400 w-full"></div>
            <div className="h-0.5 bg-blue-400 w-full"></div>
          </div>
        </div>

        <div className="px-2">
          <div className="mb-2">
            <div className="h-1 bg-blue-900 w-1/3 mb-1 border-b border-blue-900"></div>
            <div className="h-0.5 bg-gray-300 w-full mb-0.5"></div>
            <div className="h-0.5 bg-gray-300 w-4/5"></div>
          </div>

          <div className="mb-2">
            <div className="h-1 bg-blue-900 w-1/3 mb-1 border-b border-blue-900"></div>
            <div className="border-l-2 border-gray-300 pl-1 mb-1">
              <div className="h-1 bg-blue-800 w-2/5 mb-0.5"></div>
              <div className="h-0.5 bg-gray-400 w-1/3 mb-0.5"></div>
              <div className="h-0.5 bg-gray-300 w-full"></div>
            </div>
          </div>

          <div className="mb-2">
            <div className="h-1 bg-blue-900 w-1/3 mb-1 border-b border-blue-900"></div>
            <div className="border-l-2 border-gray-300 pl-1">
              <div className="h-1 bg-blue-800 w-2/5 mb-0.5"></div>
              <div className="h-0.5 bg-gray-400 w-1/3"></div>
            </div>
          </div>

          <div>
            <div className="h-1 bg-blue-900 w-1/4 mb-1 border-b border-blue-900"></div>
            <div className="grid grid-cols-3 gap-0.5">
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-0.5 bg-blue-900 rounded-full"></div>
                <div className="h-0.5 bg-gray-300 flex-1"></div>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-0.5 bg-blue-900 rounded-full"></div>
                <div className="h-0.5 bg-gray-300 flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    elegant: (
      <div className="w-full h-full bg-white p-3 text-[4px]">
        <div className="text-center mb-2">
          <div className="h-2 bg-gray-800 w-3/5 mx-auto mb-1"></div>
          <div className="h-1 bg-gray-600 w-2/5 mx-auto mb-1"></div>
          <div className="border-t border-b border-gray-300 py-0.5 my-1">
            <div className="flex justify-center gap-1">
              <div className="h-0.5 bg-gray-400 w-1/6"></div>
              <div className="w-px bg-gray-400"></div>
              <div className="h-0.5 bg-gray-400 w-1/6"></div>
            </div>
          </div>
        </div>

        <div className="mb-2 text-center">
          <div className="h-0.5 bg-gray-300 w-4/5 mx-auto mb-0.5"></div>
          <div className="h-0.5 bg-gray-300 w-3/5 mx-auto"></div>
        </div>

        <div className="mb-2">
          <div className="h-1 bg-gray-700 w-2/5 mx-auto mb-1 border-b border-gray-400"></div>
          <div className="text-center mb-1">
            <div className="h-1 bg-gray-600 w-2/5 mx-auto mb-0.5"></div>
            <div className="h-0.5 bg-gray-400 w-1/3 mx-auto mb-0.5"></div>
            <div className="h-0.5 bg-gray-300 w-3/5 mx-auto"></div>
          </div>
        </div>

        <div className="mb-2">
          <div className="h-1 bg-gray-700 w-2/5 mx-auto mb-1 border-b border-gray-400"></div>
          <div className="text-center">
            <div className="h-1 bg-gray-600 w-2/5 mx-auto mb-0.5"></div>
            <div className="h-0.5 bg-gray-400 w-1/3 mx-auto"></div>
          </div>
        </div>

        <div>
          <div className="h-1 bg-gray-700 w-1/4 mx-auto mb-1 border-b border-gray-400"></div>
          <div className="flex justify-center gap-0.5">
            <div className="h-0.5 bg-gray-300 w-1/6"></div>
            <div className="h-0.5 bg-gray-300 w-1/6"></div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-inner">
      {previewStyles[templateId as keyof typeof previewStyles]}
    </div>
  );
}
