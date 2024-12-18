import './landingPage.scss';
import avatar from '../assets/avatar.png';
import split from '../assets/split.png';

const LandingPage = () => {
    return (
        <div className="container">
            <div className="navbar">
                <h1>ShareSplit1s</h1>
                <ul>
                    <li>About Us</li>
                    <li>Features</li>
                    <li>Reviews</li>
                    <li>Newsletter</li>
                </ul>
                <button>Sign Up / Log In</button>
            </div>
            <div className="main">
                <div className="information">
                    <div className="subTitle">
                        <img src={split} alt="split" />
                        <h3> Instant Split</h3>
                    </div>

                    <h2>
                        <span style={{ wordSpacing: '-0.1em' }}>
                            {' '}
                            Split & Share <br /> Expenses With &nbsp;
                        </span>
                        <span style={{ color: '#4EA582' }}>
                            Friends <br />
                            and Family
                        </span>
                    </h2>

                    <p>
                        Simplify group expenses effortlessly. Our user friendly platform makes bill splitting,
                        <br />
                        expense tracking, and payments coordination seamless. Gain financial clarity <br /> and peace of
                        mind With ShareSplits
                    </p>
                    <button>open a ShareSplits Account</button>
                    <div className="avatars">
                        <img className="avatar-img" src={avatar} alt="avatar" />
                    </div>
                    <h4>
                        The best application to manage <br /> your Expenses in group
                    </h4>
                </div>
                <div className="app-image">imag of app</div>
            </div>
        </div>
    );
};

export default LandingPage;
