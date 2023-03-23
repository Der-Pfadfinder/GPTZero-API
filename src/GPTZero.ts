import showdown from "showdown";
import fs from 'fs';
import { fetcher } from "./util";
import { ENSPOINTS } from "./Constants";
import FormData from 'form-data';
import PDFDocument from 'pdfkit';

export class GPTZeroTextAPI {
    constructor(APIKey: string) {
        this.APIKey = APIKey;
    }

    /**
     * Get raw response for texts from GPTZero's API
     * @param text the text to be checked via GPTZero
     * @returns an object with the format of `GPTZeroResponse`
     */
    public async getRaw(text: string) {
        const response: GPTZeroResponse = await fetcher(ENSPOINTS.TEXT, FetchMethod.POST, {
            "accept": "application/json",
            "X-Api-Key": this.APIKey,
            "Content-Type": "application/json",
        }, {
            "document": text,
        });
        if (!response) throw response;
        return response;
    }

    /**
     * Get GPTZero result and export to a PDF report
     * @param text The text to be determined
     * @param filename Optional: the file to save the results
     */
    public async getPdfResult(text: string, filename?: string) {
        if (!filename)
            filename = `GPTZero Report - ${new Date().getTime()}.pdf`;

        var response = await this.getRaw(text);

        var document = new PDFDocument({ size: 'A4', font: 'Times-Roman' });
        document.pipe(fs.createWriteStream(filename));
        document.fontSize(20);
        document.text(`GPTZero Report`);
        document.fontSize(16);
        document.moveDown();
        document.text(`Overall Measurements`);
        document.fontSize(12);
        document.moveDown();
        document.list([
            `Overall Generated Probability: ${response.documents[0].average_generated_prob}`,
            `Completely Generated Probability: ${response.documents[0].completely_generated_prob}`,
            `Overall Burstiness: ${response.documents[0].overall_burstiness}`
        ]);
        document.fontSize(16);
        document.moveDown();
        document.text(`Processed Text`);
        document.moveDown();

        var paragraphs = response.documents[0].paragraphs;
        var sentences = response.documents[0].sentences;
        var noteNum = 1, footnote = ``;
        for (let i = 0; i < paragraphs.length; i++) {
            for (let j = 0; j < paragraphs[i].num_sentences; j++) {
                let index = j + paragraphs[i].start_sentence_index;
                if (sentences[index].generated_prob >= 0.5) {
                    document.fontSize(12);
                    document.fillColor('red');
                    document.text(sentences[index].sentence + ' ', { continued: true });
                    document.fontSize(8);
                    document.text(`[${noteNum}]`, { continued: true });
                    footnote += `[${noteNum}] : Generated probability: ${sentences[j].generated_prob}; Perplexity: ${sentences[j].perplexity}\n`;
                    noteNum++;
                }
                else {
                    document.fontSize(12);
                    document.fillColor('black');
                    document.text(sentences[index].sentence + ' ', { continued: true });
                }
            }
            document.fontSize(12);
            document.fillColor('black');
            document.text('\n');
            document.moveDown();
        }
        document.moveDown(3);
        document.fontSize(12);
        document.text('Notes');
        document.fontSize(8);
        document.fillColor('black');
        if (!footnote.length || footnote == '')
            document.text('No notes were recorded');
        document.text(footnote);
        document.end();
        return response;
    }

    private APIKey: string;
}

export class GPTZeroFileAPI {
    constructor(APIKey: string) {
        this.APIKey = APIKey;
    }
    /**
     * Get raw response for a list of files from GPTZero's API
     * @param files an array of strings storing the paths to the files to be processed.
     * @returns an object following the format of `GPTZeroResponse`
     */
    public async getRaw(files: string[]) {
        let form = new FormData();
        for (let i in files) {
            form.append('files', fs.createReadStream(files[i]));
        }
        const response: GPTZeroResponse = await fetcher(ENSPOINTS.FILES, FetchMethod.POST, {
            "accept": "application/json",
            "X-Api-Key": this.APIKey,
            "Content-Type": "multipart/form-data"
        }, {
            "files": form
        });
        if (!response) throw response;
        return response;
    }

    /**
     * Get GPTZero result and export to a PDF report
     * @param text The text to be determined
     * @param filenames Optional: the file to save the results
     */
    public async getPdfResult(files: string[], filenames?: string[]) {
        var responses = await this.getRaw(files);

        for (let i = 0; i < files.length; i++) {
            var filename = `GPTZero Report - ${new Date().getTime()}.pdf`
            if (filenames && filenames.length >= i) {
                filename = filenames[i];
            }
            var document = new PDFDocument({ size: 'A4', font: 'Times-Roman' });
            document.pipe(fs.createWriteStream(filename));
            document.fontSize(20);
            document.text(`GPTZero Report`);
            document.fontSize(16);
            document.moveDown();
            document.text(`Overall Measurements`);
            document.fontSize(12);
            document.moveDown();
            document.list([
                `Overall Generated Probability: ${responses.documents[i].average_generated_prob}`,
                `Completely Generated Probability: ${responses.documents[i].completely_generated_prob}`,
                `Overall Burstiness: ${responses.documents[i].overall_burstiness}`
            ]);
            document.fontSize(16);
            document.moveDown();
            document.text(`Processed Text`);
            document.moveDown();
            var paragraphs = responses.documents[i].paragraphs;
            var sentences = responses.documents[i].sentences;
            var noteNum = 1, footnote = ``;
            for (let j = 0; j < paragraphs.length; j++) {
                for (let k = 0; k < paragraphs[j].num_sentences; k++) {
                    let index = k + paragraphs[j].start_sentence_index;
                    if (sentences[index].generated_prob >= 0.5) {
                        document.fontSize(12);
                        document.fillColor('red');
                        document.text(sentences[index].sentence + ' ', { continued: true });
                        document.fontSize(8);
                        document.text(`[${noteNum}]`, { continued: true });
                        footnote += `[${noteNum}] : Generated probability: ${sentences[k].generated_prob}; Perplexity: ${sentences[j].perplexity}\n`;
                        noteNum++;
                    }
                    else {
                        document.fontSize(12);
                        document.fillColor('black');
                        document.text(sentences[index].sentence + ' ', { continued: true });
                    }
                }
                document.fontSize(12);
                document.fillColor('black');
                document.text('\n');
                document.moveDown();
            }
            document.moveDown(3);
            document.fontSize(12);
            document.text('Notes');
            document.fontSize(8);
            document.fillColor('black');
            if (!footnote.length || footnote == '')
                document.text('No notes were recorded');
            document.text(footnote);
            document.end();
        }
        return responses;
    }

    private APIKey: string;
}