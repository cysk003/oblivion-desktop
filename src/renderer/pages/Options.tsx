import classNames from 'classnames';
import { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import Lottie from 'lottie-react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import Nav from '../components/Nav';
import { settings } from '../lib/settings';
import { defaultSettings, languages } from '../../defaultSettings';
import LottieFile from '../../../assets/json/1713988096625.json';
import RestoreModal from '../components/Modal/Restore';
import { loadingToast } from '../lib/toasts';
import { getLang, loadLang } from '../lib/loaders';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';
import Tabs from '../components/Tabs';

export default function Options() {
    useGoBackOnEscape();

    const [theme, setTheme] = useState<undefined | string>();
    const [lang, setLang] = useState<string>('');
    const [systemTray, setSystemTray] = useState<undefined | boolean>();
    const [openAtLogin, setOpenAtLogin] = useState<undefined | boolean>();
    const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
    const [appLang, setAppLang] = useState(getLang());

    const { state } = useLocation();
    const { targetId } = state || {};
    const langRef = useRef<HTMLDivElement>(null);
    const detectingSystemTheme = window?.matchMedia('(prefers-color-scheme: dark)')?.matches;

    useEffect(() => {
        setTimeout(function () {
            if (langRef && targetId === 'languages') {
                langRef?.current?.scrollIntoView();
                langRef?.current?.classList?.add('highlight');
                setTimeout(function () {
                    langRef?.current?.classList?.remove('highlight');
                }, 3000);
            }
        }, 1000);
    }, [targetId]);

    useEffect(() => {
        settings.get('theme').then((value) => {
            setTheme(
                typeof value === 'undefined' ? (detectingSystemTheme ? 'dark' : 'light') : value
            );
        });
        settings.get('lang').then((value) => {
            setLang(typeof value === 'undefined' ? defaultSettings.lang : value);
        });
        settings.get('systemTray').then((value) => {
            setSystemTray(typeof value === 'undefined' ? defaultSettings.systemTray : value);
        });
        settings.get('openAtLogin').then((value) => {
            setOpenAtLogin(typeof value === 'undefined' ? defaultSettings.openAtLogin : value);
        });
    }, []);

    const onCloseRestoreModal = useCallback(() => {
        setShowRestoreModal(false);
        setTimeout(function () {
            loadLang();
        }, 750);
        setTimeout(function () {
            setAppLang(getLang());
        }, 1500);
    }, []);

    const onChangeTheme = useCallback(() => {
        const tmp = theme === 'light' ? 'dark' : 'light';
        setTheme(tmp);
        settings.set('theme', tmp);
        document.documentElement.setAttribute('data-bs-theme', tmp);
    }, [theme]);

    const onChangeLanguage = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setLang(e.target.value);
        settings.set('lang', e.target.value);
        loadingToast();

        setTimeout(function () {
            loadLang();
        }, 750);

        setTimeout(function () {
            setAppLang(getLang());
            toast.dismiss('LOADING');
        }, 1500);
    }, []);

    const onClickAutoStartButton = useCallback(() => {
        setOpenAtLogin(!openAtLogin);
        settings.set('openAtLogin', !openAtLogin);
    }, [openAtLogin]);

    const onClicksystemTrayButton = useCallback(() => {
        setSystemTray(!systemTray);
        settings.set('systemTray', !systemTray);
    }, [systemTray]);

    const onOpenRestoreModal = useCallback(() => setShowRestoreModal(true), []);

    if (
        typeof theme === 'undefined' ||
        typeof lang === 'undefined' ||
        typeof systemTray === 'undefined' ||
        typeof openAtLogin === 'undefined'
    )
        return (
            <div className='settings'>
                <div className='lottie'>
                    <Lottie animationData={LottieFile} loop={true} />
                </div>
            </div>
        );

    return (
        <>
            <Nav title={appLang?.settings?.option} />
            <RestoreModal
                {...{
                    setTheme,
                    setSystemTray,
                    setLang,
                    setOpenAtLogin
                }}
                title={appLang?.modal?.restore_title}
                isOpen={showRestoreModal}
                onClose={onCloseRestoreModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='options' />
                <div className='settings' role='menu'>
                    <div
                        role='presentation'
                        className='item'
                        onClick={onChangeTheme}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onChangeTheme();
                            }
                        }}
                    >
                        <label className='key' htmlFor='flexSwitchCheckChecked' role='label'>
                            {appLang?.settings?.dark_mode}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                className={classNames(
                                    'checkbox',
                                    theme === 'dark' ? 'checked' : ''
                                )}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info' id='flexSwitchCheckChecked'>
                            {appLang?.settings?.dark_mode_desc}
                        </div>
                    </div>
                    <div className='item' role='presentation' ref={langRef}>
                        <label className='key' htmlFor='lang-select' role='label'>
                            {appLang?.settings?.lang}
                        </label>
                        <div className='value'>
                            <select
                                id='lang-select'
                                onChange={onChangeLanguage}
                                value={lang}
                                tabIndex={0}
                                role='listbox'
                            >
                                {languages.map((lng) => (
                                    <option key={lng.value} value={lng.value} role='option'>
                                        {lng.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='info'>{appLang?.settings?.lang_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className='item'
                        onClick={onClickAutoStartButton}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onClickAutoStartButton();
                            }
                        }}
                    >
                        <label className='key' htmlFor='open-login' role='label'>
                            {appLang?.settings?.open_login}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                id='open-login'
                                className={classNames('checkbox', openAtLogin ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.open_login_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className='item'
                        onClick={onClicksystemTrayButton}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onClicksystemTrayButton();
                            }
                        }}
                    >
                        <label className='key' htmlFor='system-tray' role='label'>
                            {appLang?.settings?.system_tray}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                id='system-tray'
                                className={classNames('checkbox', systemTray ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.system_tray_desc}</div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings' role='menu'>
                    <div
                        role='presentation'
                        className={'item'}
                        onClick={onOpenRestoreModal}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onOpenRestoreModal();
                            }
                        }}
                    >
                        <label className='key' htmlFor='restore' role='label'>
                            {appLang?.settings?.restore}
                        </label>
                        <div className='value' id='restore' tabIndex={-1}>
                            <i className='material-icons'>&#xe8ba;</i>
                        </div>
                        <div className='info'>{appLang?.settings?.restore_desc}</div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
