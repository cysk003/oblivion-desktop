import classNames from 'classnames';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../lib/settings';
import { getLang } from '../../lib/loaders';

interface RoutingRulesModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    routingRules: string;
    setRoutingRules: (value: string) => void;
}

export default function RoutingRulesModal({
    title,
    isOpen,
    onClose,
    routingRules,
    setRoutingRules
}: RoutingRulesModalProps) {
    const [routingRulesInput, setRoutingRulesInput] = useState<string>(routingRules);
    const [showModal, setshowModal] = useState<boolean>(isOpen);

    useEffect(() => setshowModal(isOpen), [isOpen]);

    const handleOnClose = useCallback(() => {
        setshowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const appLang = getLang();

    const validateRules = useCallback((textareaContent: string): string => {
        if (textareaContent === '') {
            return '';
        }
        const lines = textareaContent.split('\n');
        const validEntriesSet = new Set<string>();
        const entryRegex = /^(geoip|domain):(.+)$/;
        const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
        const ipRangeRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const lineWithoutQuotes = trimmedLine.replace(/['"]/g, '').replace(/ /g, '');
                const entry = lineWithoutQuotes.endsWith(',')
                    ? lineWithoutQuotes.slice(0, -1)
                    : lineWithoutQuotes;
                const cleanedEntry = entry.replace(/,+$/, '');
                const match = cleanedEntry.match(entryRegex);
                const ipMatch = cleanedEntry.match(ipRegex);
                const ipRangeMatch = cleanedEntry.match(ipRangeRegex);
                if (match || ipMatch || ipRangeMatch) {
                    validEntriesSet.add(cleanedEntry);
                }
            }
        });
        const validEntries = Array.from(validEntriesSet);
        return validEntries.length > 0 ? validEntries.join(',\n') : '';
    }, []);

    const onSaveModal = useCallback(() => {
        const checkRules = validateRules(routingRulesInput);
        if (checkRules) {
            setRoutingRules(checkRules);
            setRoutingRulesInput(checkRules);
            settings.set('routingRules', checkRules);
        } else {
            setRoutingRules('');
            setRoutingRulesInput('');
            settings.set('routingRules', '');
        }
        handleOnClose();
    }, [routingRulesInput, validateRules, handleOnClose, setRoutingRules, setRoutingRulesInput]);

    const handleCancelButtonClick = useCallback(() => {
        setRoutingRulesInput(routingRules);
        handleOnClose();
    }, [routingRules, handleOnClose]);

    const handleRoutingRulesInput = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            setRoutingRulesInput(e.target.value);
        },
        [setRoutingRulesInput]
    );

    const handleSetRoutingRulesSimple = useCallback(() => {
        setRoutingRulesInput(`domain:dolat.ir,\ndomain:apple.com,\ngeoip:127.0.0.1,\ndomain:*.ir`);
    }, [setRoutingRulesInput]);

    if (!isOpen) return <></>;

    return (
        <div className={classNames('dialog', !showModal ? 'no-opacity' : '')}>
            <div className='dialogBg' onClick={handleOnClose} role='presentation' />
            <div className='dialogBox'>
                <div className='container'>
                    <div className='line'>
                        <div className='miniLine' />
                    </div>
                    <h3>
                        {title}
                        <div className='labels'>
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-warning',
                                    'pull-right',
                                    routingRulesInput === '' ? '' : 'hidden'
                                )}
                                onClick={handleSetRoutingRulesSimple}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.routing_rules_sample}
                            </div>
                        </div>
                    </h3>
                    <textarea
                        value={routingRulesInput}
                        spellCheck={false}
                        className='form-control'
                        onChange={handleRoutingRulesInput}
                        tabIndex={0}
                    />
                    <div className='clearfix' />
                    <div
                        role='button'
                        tabIndex={0}
                        aria-hidden='true'
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCancelButtonClick();
                            }
                        }}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        tabIndex={0}
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSaveModal();
                            }
                        }}
                    >
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
}
