import { Button } from "@/components/ui/button";
import { Delete } from 'lucide-react';

export default function NumberPad({ onKeyPress }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                <Button
                    key={num}
                    variant="outline"
                    className="h-12 text-lg font-semibold"
                    onClick={() => onKeyPress(num.toString())}
                >
                    {num}
                </Button>
            ))}
            <Button
                variant="outline"
                className="h-12"
                onClick={() => onKeyPress('backspace')}
            >
                <Delete className="h-4 w-4" />
            </Button>
        </div>
    );
}