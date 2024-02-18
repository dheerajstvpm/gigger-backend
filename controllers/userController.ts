import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userDetails";
import Admin from "../models/adminDetails";

const userSignupPost = async (
  req: {
    body: {
      otp: string;
      password: any;
      artistFlag: any;
      name: any;
      username: string;
    };
  },
  res: { send: (arg0: { token: any }) => void },
) => {
  if (req.body.otp === "") {
    res.send({ token: "OTP sent" });
  } else {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash: any) => {
        const user = new User({
          artistFlag: req.body.artistFlag,
          name: req.body.name,
          username: req.body.username.toLowerCase(),
          password: hash,
        });
        user
          .save()
          .then((result) => {
            console.log(result);
            const payload = { subject: result._id };
            const token = jwt.sign(payload, String(process.env.jwtKey));
            res.send({ token });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
};

const userLoginPost = async (
  req: { body: { username: any; password: any } },
  res: { send: (arg0: { loginError?: string; token?: any }) => void },
) => {
  try {
    const user: any = await User.findOne({ username: req.body.username });
    if (!user) {
      res.send({ loginError: "Invalid username" });
    } else if (user.blockStatus) {
      res.send({ loginError: "User blocked" });
    } else {
      bcrypt
        .compare(req.body.password, user.password)
        .then((bcryptResult: any) => {
          if (bcryptResult) {
            const payload = { subject: user._id };
            const token = jwt.sign(payload, String(process.env.jwtKey));
            res.send({ token });
          } else {
            res.send({ loginError: "Invalid password" });
          }
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  } catch (err) {
    console.log(err);
  }
};

const adminLoginPost = async (
  req: { body: { username: any; password: any } },
  res: { send: (arg0: { loginError?: string; token?: any }) => void },
) => {
  try {
    const admin: any = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      res.send({ loginError: "Invalid username" });
    } else if (admin.blockStatus) {
      res.send({ loginError: "User blocked" });
    } else {
      bcrypt
        .compare(req.body.password, admin.password)
        .then((bcryptResult: any) => {
          if (bcryptResult) {
            const payload = { subject: admin._id };
            const token = jwt.sign(payload, String(process.env.jwtKey));
            res.send({ token });
          } else {
            res.send({ loginError: "Invalid password" });
          }
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  } catch (err) {
    console.log(err);
  }
};

const usersGet = async (req: any, res: any) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

const profileGet = async (req: any, res: any) => {
  try {
    const user = await User.findOne({ _id: req.userId }).select("-password");
    // console.log(user._id);
    res.send(user);
  } catch (err) {
    console.log(err);
  }
};

const profilePost = async (req: any, res: any) => {
  try {
    console.log(req.body);
    console.log(req.userId);
    await User.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          blockStatus: req.body.blockStatus,
          name: req.body.name,
          aboutMe: req.body.aboutMe,
          favouriteTracks: req.body.favouriteTracks,
          favouriteArtists: req.body.favouriteArtists,
          eventBookings: req.body.eventBookings,
        },
      },
    );
    const user = await User.findOne({ _id: req.body._id }).select("-password");
    res.send(user);
  } catch (err) {
    console.log(err);
  }
};

const userController = {
  userSignupPost,
  userLoginPost,
  usersGet,
  profileGet,
  profilePost,
  adminLoginPost,
};

export default userController;
