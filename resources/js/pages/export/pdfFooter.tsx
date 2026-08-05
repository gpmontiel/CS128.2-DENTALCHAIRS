import jsPDF from "jspdf";

type FooterParams = {
    doc: jsPDF;
};

export const drawPDFCommonFooter = ({
                                        doc,
                                    }: FooterParams) => {
    const totalPages = doc.getNumberOfPages();

    const generatedDate =
        new Date().toLocaleString("en-US");

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        const pageWidth =
            doc.internal.pageSize.getWidth();

        const pageHeight =
            doc.internal.pageSize.getHeight();

        // FOOTER STYLE
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120);

        // PAGE NUMBER
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            {
                align: "center",
            }
        );

        // GENERATED DATE
        doc.text(
            `Generated: ${generatedDate}`,
            pageWidth - 14,
            pageHeight - 10,
            {
                align: "right",
            }
        );
    }
};
