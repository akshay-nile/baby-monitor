import Header from './Header';
import PageAnimation from './PageAnimation';

function UserSettings() {
    return (
        <PageAnimation>
            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center p-4 text-white bg-neutral-800 rounded-xl select-none duration-300 transition-all">
                <Header screen="settings">User Settings</Header>
            </div>
        </PageAnimation>
    );
}

export default UserSettings;